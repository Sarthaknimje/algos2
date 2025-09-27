"""
Competition management and logic for Algo Premier League
"""

from algopy import ARC4Contract, String, UInt64, GlobalState, LocalState, Account, Asset, Txn, Global
from algopy.arc4 import abimethod, DynamicArray
from .utils import calculate_trade_return, validate_trade_amount
from .security import SecurityValidator, RateLimiter


class CompetitionManager(ARC4Contract):
    """Competition management contract for Algo Premier League"""
    
    # Global competition state
    competition_id: GlobalState[UInt64]
    competition_name: GlobalState[String]
    start_time: GlobalState[UInt64]
    end_time: GlobalState[UInt64]
    entry_fee: GlobalState[UInt64]
    max_players: GlobalState[UInt64]
    total_pool: GlobalState[UInt64]
    is_active: GlobalState[bool]
    is_paused: GlobalState[bool]
    
    # Player management
    total_players: GlobalState[UInt64]
    player_registry: GlobalState[DynamicArray[Account]]
    
    # Player local state
    player_joined: LocalState[bool]
    player_balance: LocalState[UInt64]
    player_returns: LocalState[UInt64]
    player_trades: LocalState[UInt64]
    player_rank: LocalState[UInt64]
    join_time: LocalState[UInt64]
    
    def __init__(self) -> None:
        """Initialize competition manager"""
        self.competition_id = GlobalState(UInt64(0))
        self.competition_name = GlobalState(String(""))
        self.start_time = GlobalState(UInt64(0))
        self.end_time = GlobalState(UInt64(0))
        self.entry_fee = GlobalState(UInt64(0))
        self.max_players = GlobalState(UInt64(100))
        self.total_pool = GlobalState(UInt64(0))
        self.is_active = GlobalState(False)
        self.is_paused = GlobalState(False)
        
        self.total_players = GlobalState(UInt64(0))
        self.player_registry = GlobalState(DynamicArray[Account]())
        
        self.player_joined = LocalState(False)
        self.player_balance = LocalState(UInt64(0))
        self.player_returns = LocalState(UInt64(0))
        self.player_trades = LocalState(UInt64(0))
        self.player_rank = LocalState(UInt64(0))
        self.join_time = LocalState(UInt64(0))
    
    @abimethod()
    def create_competition(
        self,
        name: String,
        start_time: UInt64,
        duration_hours: UInt64,
        entry_fee: UInt64,
        max_players: UInt64
    ) -> String:
        """Create a new competition
        
        Args:
            name: Competition name
            start_time: Start timestamp
            duration_hours: Duration in hours
            entry_fee: Entry fee in microALGOs
            max_players: Maximum number of players
            
        Returns:
            Success message
        """
        # Only creator can create competitions
        assert Txn.sender == Global.creator_address, "Only creator can create competitions"
        
        # Validate parameters
        assert SecurityValidator.validate_entry_fee(entry_fee), "Invalid entry fee"
        assert max_players > UInt64(0) and max_players <= UInt64(1000), "Invalid max players"
        assert duration_hours > UInt64(0) and duration_hours <= UInt64(168), "Invalid duration"  # Max 1 week
        
        # Set competition parameters
        self.competition_id = GlobalState(self.competition_id.value + UInt64(1))
        self.competition_name = GlobalState(name)
        self.start_time = GlobalState(start_time)
        self.end_time = GlobalState(start_time + (duration_hours * UInt64(3600)))
        self.entry_fee = GlobalState(entry_fee)
        self.max_players = GlobalState(max_players)
        self.is_active = GlobalState(True)
        self.is_paused = GlobalState(False)
        
        return f"Competition '{name}' created successfully! 🏆"
    
    @abimethod()
    def join_competition(self) -> String:
        """Join the current competition
        
        Returns:
            Success message
        """
        # Validate competition state
        assert self.is_active.value, "Competition not active"
        assert not self.is_paused.value, "Competition is paused"
        assert not self.player_joined.value, "Already joined competition"
        
        # Check capacity
        assert SecurityValidator.validate_competition_capacity(
            self.total_players.value, 
            self.max_players.value
        ), "Competition at capacity"
        
        # Check timing
        current_time = Global.latest_timestamp
        assert SecurityValidator.validate_competition_time(
            current_time, 
            self.start_time.value, 
            self.end_time.value
        ), "Outside competition time"
        
        # Transfer entry fee
        InnerTxnBuilder.Begin()
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Global.current_application_address,
            TxnField.amount: self.entry_fee.value,
            TxnField.sender: Txn.sender,
        })
        InnerTxnBuilder.Submit()
        
        # Update player state
        self.player_joined = LocalState(True)
        self.player_balance = LocalState(self.entry_fee.value)
        self.player_returns = LocalState(UInt64(0))
        self.player_trades = LocalState(UInt64(0))
        self.player_rank = LocalState(UInt64(0))
        self.join_time = LocalState(current_time)
        
        # Update global state
        self.total_players = GlobalState(self.total_players.value + UInt64(1))
        self.total_pool = GlobalState(self.total_pool.value + self.entry_fee.value)
        
        # Add to player registry
        current_registry = self.player_registry.value
        current_registry.append(Txn.sender)
        self.player_registry = GlobalState(current_registry)
        
        return f"Welcome to {self.competition_name.value}! 🚀"
    
    @abimethod()
    def execute_trade(
        self,
        asset: Asset,
        amount: UInt64,
        trade_type: String
    ) -> String:
        """Execute a trade in the competition
        
        Args:
            asset: Asset to trade
            amount: Trade amount
            trade_type: "BUY" or "SELL"
            
        Returns:
            Trade confirmation
        """
        # Validate player and competition state
        assert self.player_joined.value, "Must join competition first"
        assert self.is_active.value, "Competition not active"
        assert not self.is_paused.value, "Competition is paused"
        
        # Validate trade parameters
        assert validate_trade_amount(amount), "Invalid trade amount"
        assert SecurityValidator.validate_player_balance(
            self.player_balance.value, 
            amount, 
            trade_type
        ), "Insufficient balance"
        
        # Check timing
        current_time = Global.latest_timestamp
        assert SecurityValidator.validate_competition_time(
            current_time, 
            self.start_time.value, 
            self.end_time.value
        ), "Outside competition time"
        
        # Calculate trade return
        return_amount = calculate_trade_return(amount, asset, trade_type)
        
        # Update player state
        if trade_type == "BUY":
            self.player_balance = LocalState(self.player_balance.value - amount)
            self.player_returns = LocalState(self.player_returns.value + return_amount)
        else:  # SELL
            self.player_balance = LocalState(self.player_balance.value + amount)
            self.player_returns = LocalState(self.player_returns.value + return_amount)
        
        self.player_trades = LocalState(self.player_trades.value + UInt64(1))
        
        return f"Trade executed: {trade_type} {amount} {asset} → {return_amount} ✅"
    
    @abimethod()
    def get_player_stats(self) -> String:
        """Get current player statistics
        
        Returns:
            Player stats as string
        """
        if not self.player_joined.value:
            return "Not joined to competition"
        
        balance = self.player_balance.value
        returns = self.player_returns.value
        trades = self.player_trades.value
        total_value = balance + returns
        
        return f"Balance: {balance} | Returns: {returns} | Trades: {trades} | Total: {total_value}"
    
    @abimethod()
    def get_competition_info(self) -> String:
        """Get competition information
        
        Returns:
            Competition details
        """
        status = "Active" if self.is_active.value else "Inactive"
        if self.is_paused.value:
            status = "Paused"
        
        return f"Name: {self.competition_name.value} | Status: {status} | Players: {self.total_players.value}/{self.max_players.value} | Pool: {self.total_pool.value}"
    
    @abimethod()
    def pause_competition(self, reason: String) -> String:
        """Pause the competition (emergency function)
        
        Args:
            reason: Reason for pausing
            
        Returns:
            Confirmation message
        """
        assert Txn.sender == Global.creator_address, "Only creator can pause"
        
        self.is_paused = GlobalState(True)
        return f"Competition paused: {reason} ⏸️"
    
    @abimethod()
    def resume_competition(self) -> String:
        """Resume the competition
        
        Returns:
            Confirmation message
        """
        assert Txn.sender == Global.creator_address, "Only creator can resume"
        
        self.is_paused = GlobalState(False)
        return "Competition resumed! ▶️"
    
    @abimethod()
    def end_competition(self) -> String:
        """End the competition and determine winner
        
        Returns:
            Winner announcement
        """
        assert Txn.sender == Global.creator_address, "Only creator can end competition"
        
        current_time = Global.latest_timestamp
        assert current_time >= self.end_time.value, "Competition time not ended"
        
        self.is_active = GlobalState(False)
        
        # In a real implementation, would calculate actual winner
        # For demo, we'll return a placeholder message
        return f"🏆 Competition '{self.competition_name.value}' ended! Winner will be announced soon!"
