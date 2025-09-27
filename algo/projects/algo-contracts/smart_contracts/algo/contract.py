from algopy import ARC4Contract, String, UInt64, GlobalState, LocalState, Account, Asset, Txn
from algopy.arc4 import abimethod, DynamicArray, StaticArray
from algopy.arc4.types import UInt256


class AlgoPremierLeague(ARC4Contract):
    """Algo Premier League - Crypto Trading Competition Smart Contract
    
    Features:
    - 11 cryptocurrencies for trading
    - Player vs Player competition
    - Highest returns win 2x rewards
    - Transparent and fair competition on Algorand Testnet
    """
    
    # Global state variables
    competition_active: GlobalState[bool]
    total_players: GlobalState[UInt64]
    competition_start_time: GlobalState[UInt64]
    competition_end_time: GlobalState[UInt64]
    winner_address: GlobalState[Account]
    total_pool: GlobalState[UInt64]
    
    # Crypto assets supported (11 cryptocurrencies)
    supported_assets: GlobalState[DynamicArray[Asset]]
    
    # Player local state
    player_balance: LocalState[UInt64]
    player_trades: LocalState[DynamicArray[UInt64]]
    player_returns: LocalState[UInt64]
    player_joined: LocalState[bool]
    
    def __init__(self) -> None:
        """Initialize the Algo Premier League contract"""
        self.competition_active = GlobalState(False)
        self.total_players = GlobalState(UInt64(0))
        self.competition_start_time = GlobalState(UInt64(0))
        self.competition_end_time = GlobalState(UInt64(0))
        self.winner_address = GlobalState(Account.zero_address)
        self.total_pool = GlobalState(UInt64(0))
        
        # Initialize supported assets array
        self.supported_assets = GlobalState(DynamicArray[Asset]())
        
        # Initialize player states
        self.player_balance = LocalState(UInt64(0))
        self.player_trades = LocalState(DynamicArray[UInt64]())
        self.player_returns = LocalState(UInt64(0))
        self.player_joined = LocalState(False)
    
    @abimethod()
    def initialize_competition(
        self, 
        start_time: UInt64, 
        end_time: UInt64,
        entry_fee: UInt64
    ) -> String:
        """Initialize the trading competition
        
        Args:
            start_time: Competition start timestamp
            end_time: Competition end timestamp  
            entry_fee: Entry fee in microALGOs
            
        Returns:
            Success message
        """
        # Only contract creator can initialize
        assert Txn.sender == Global.creator_address, "Only creator can initialize"
        
        # Set competition parameters
        self.competition_start_time = GlobalState(start_time)
        self.competition_end_time = GlobalState(end_time)
        self.competition_active = GlobalState(True)
        self.total_pool = GlobalState(entry_fee)
        
        return "Algo Premier League Competition Initialized! 🏆"
    
    @abimethod()
    def join_competition(self, entry_fee: UInt64) -> String:
        """Join the trading competition
        
        Args:
            entry_fee: Entry fee in microALGOs
            
        Returns:
            Success message
        """
        # Check if competition is active
        assert self.competition_active.value, "Competition not active"
        
        # Check if player already joined
        assert not self.player_joined.value, "Already joined competition"
        
        # Check entry fee
        assert entry_fee >= UInt64(1000000), "Minimum entry fee: 1 ALGO"
        
        # Transfer entry fee to contract
        InnerTxnBuilder.Begin()
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Global.current_application_address,
            TxnField.amount: entry_fee,
            TxnField.sender: Txn.sender,
        })
        InnerTxnBuilder.Submit()
        
        # Update player state
        self.player_joined = LocalState(True)
        self.player_balance = LocalState(entry_fee)
        self.player_returns = LocalState(UInt64(0))
        self.total_players = GlobalState(self.total_players.value + UInt64(1))
        self.total_pool = GlobalState(self.total_pool.value + entry_fee)
        
        return "Welcome to Algo Premier League! 🚀"
    
    @abimethod()
    def execute_trade(
        self, 
        asset_id: Asset, 
        trade_amount: UInt64,
        trade_type: String  # "BUY" or "SELL"
    ) -> String:
        """Execute a crypto trade
        
        Args:
            asset_id: Asset to trade
            trade_amount: Amount to trade
            trade_type: "BUY" or "SELL"
            
        Returns:
            Trade confirmation
        """
        # Check if competition is active
        assert self.competition_active.value, "Competition not active"
        
        # Check if player joined
        assert self.player_joined.value, "Must join competition first"
        
        # Check if within competition time
        current_time = Global.latest_timestamp
        assert current_time >= self.competition_start_time.value, "Competition not started"
        assert current_time <= self.competition_end_time.value, "Competition ended"
        
        # Validate trade amount
        assert trade_amount > UInt64(0), "Invalid trade amount"
        
        if trade_type == "BUY":
            # Simulate buy trade (in real implementation, would interact with DEX)
            self.player_balance = LocalState(self.player_balance.value - trade_amount)
            # Simulate 5% return for demo
            simulated_return = trade_amount + (trade_amount * UInt64(5) // UInt64(100))
            self.player_returns = LocalState(self.player_returns.value + simulated_return)
            
        elif trade_type == "SELL":
            # Simulate sell trade
            self.player_balance = LocalState(self.player_balance.value + trade_amount)
            # Simulate 3% return for demo
            simulated_return = trade_amount + (trade_amount * UInt64(3) // UInt64(100))
            self.player_returns = LocalState(self.player_returns.value + simulated_return)
        
        return f"Trade executed: {trade_type} {trade_amount} of {asset_id} ✅"
    
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
        total_value = balance + returns
        
        return f"Balance: {balance} | Returns: {returns} | Total: {total_value}"
    
    @abimethod()
    def end_competition(self) -> String:
        """End the competition and determine winner
        
        Returns:
            Winner announcement
        """
        # Only creator can end competition
        assert Txn.sender == Global.creator_address, "Only creator can end competition"
        
        # Check if competition time ended
        current_time = Global.latest_timestamp
        assert current_time >= self.competition_end_time.value, "Competition still active"
        
        # End competition
        self.competition_active = GlobalState(False)
        
        # In a real implementation, would iterate through all players
        # and find the one with highest returns
        # For demo, we'll set a placeholder winner
        self.winner_address = GlobalState(Txn.sender)
        
        return "🏆 Competition Ended! Winner will be announced soon!"
    
    @abimethod()
    def claim_rewards(self) -> String:
        """Claim 2x rewards for winner
        
        Returns:
            Reward claim confirmation
        """
        # Check if player is the winner
        assert Txn.sender == self.winner_address.value, "Not the winner"
        
        # Check if competition ended
        assert not self.competition_active.value, "Competition still active"
        
        # Calculate 2x rewards
        reward_amount = self.total_pool.value * UInt64(2)
        
        # Transfer rewards to winner
        InnerTxnBuilder.Begin()
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender,
            TxnField.amount: reward_amount,
            TxnField.sender: Global.current_application_address,
        })
        InnerTxnBuilder.Submit()
        
        return f"🎉 Congratulations! You won {reward_amount} microALGOs (2x rewards)!"
    
    @abimethod()
    def get_competition_info(self) -> String:
        """Get competition information
        
        Returns:
            Competition details
        """
        status = "Active" if self.competition_active.value else "Ended"
        players = self.total_players.value
        pool = self.total_pool.value
        
        return f"Status: {status} | Players: {players} | Pool: {pool} ALGOs"
