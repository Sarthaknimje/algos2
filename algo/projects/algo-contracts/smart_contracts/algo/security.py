"""
Security utilities and validation functions for Algo Premier League
"""

from algopy import UInt64, Account, Asset, String, Txn, Global
from algopy.arc4 import abimethod


class SecurityValidator:
    """Security validation utilities for the smart contract"""
    
    @staticmethod
    def validate_entry_fee(entry_fee: UInt64, min_fee: UInt64 = UInt64(1000000)) -> bool:
        """
        Validate entry fee meets minimum requirements
        
        Args:
            entry_fee: Proposed entry fee
            min_fee: Minimum allowed fee (default 1 ALGO)
            
        Returns:
            True if valid, False otherwise
        """
        return entry_fee >= min_fee
    
    @staticmethod
    def validate_trade_amount(amount: UInt64, min_amount: UInt64 = UInt64(100000)) -> bool:
        """
        Validate trade amount is within acceptable limits
        
        Args:
            amount: Trade amount to validate
            min_amount: Minimum trade amount (default 0.1 ALGO)
            
        Returns:
            True if valid, False otherwise
        """
        return amount >= min_amount and amount <= UInt64(1000000000)  # Max 1000 ALGO
    
    @staticmethod
    def validate_competition_time(
        current_time: UInt64, 
        start_time: UInt64, 
        end_time: UInt64
    ) -> bool:
        """
        Validate if current time is within competition period
        
        Args:
            current_time: Current timestamp
            start_time: Competition start time
            end_time: Competition end time
            
        Returns:
            True if within competition time, False otherwise
        """
        return start_time <= current_time <= end_time
    
    @staticmethod
    def validate_player_balance(
        player_balance: UInt64, 
        trade_amount: UInt64, 
        trade_type: String
    ) -> bool:
        """
        Validate player has sufficient balance for trade
        
        Args:
            player_balance: Current player balance
            trade_amount: Amount to trade
            trade_type: "BUY" or "SELL"
            
        Returns:
            True if sufficient balance, False otherwise
        """
        if trade_type == "BUY":
            return player_balance >= trade_amount
        return True  # SELL trades don't require balance check
    
    @staticmethod
    def validate_asset_support(asset: Asset) -> bool:
        """
        Validate if asset is supported in the competition
        
        Args:
            asset: Asset to validate
            
        Returns:
            True if supported, False otherwise
        """
        supported_assets = [
            # In a real implementation, these would be actual asset IDs
            # For demo purposes, we'll accept any asset
        ]
        return True  # Accept all assets for demo
    
    @staticmethod
    def validate_competition_capacity(
        current_players: UInt64, 
        max_players: UInt64 = UInt64(100)
    ) -> bool:
        """
        Validate competition hasn't reached maximum capacity
        
        Args:
            current_players: Current number of players
            max_players: Maximum allowed players
            
        Returns:
            True if capacity available, False otherwise
        """
        return current_players < max_players
    
    @staticmethod
    def validate_creator_permissions(sender: Account, creator: Account) -> bool:
        """
        Validate sender has creator permissions
        
        Args:
            sender: Transaction sender
            creator: Contract creator
            
        Returns:
            True if sender is creator, False otherwise
        """
        return sender == creator
    
    @staticmethod
    def validate_winner_claim(
        sender: Account, 
        winner: Account, 
        competition_ended: bool
    ) -> bool:
        """
        Validate winner can claim rewards
        
        Args:
            sender: Transaction sender
            winner: Competition winner
            competition_ended: Whether competition has ended
            
        Returns:
            True if valid claim, False otherwise
        """
        return sender == winner and competition_ended
    
    @staticmethod
    def calculate_security_score(
        player_trades: UInt64,
        player_returns: UInt64,
        competition_duration: UInt64
    ) -> UInt64:
        """
        Calculate security score for player (anti-manipulation)
        
        Args:
            player_trades: Number of trades by player
            player_returns: Total returns by player
            competition_duration: Duration of competition in seconds
            
        Returns:
            Security score (0-100, higher is more suspicious)
        """
        # Simple scoring algorithm
        trade_frequency = player_trades * UInt64(3600) // competition_duration  # trades per hour
        
        if trade_frequency > UInt64(10):  # More than 10 trades per hour
            return UInt64(80)  # High suspicion
        elif trade_frequency > UInt64(5):  # More than 5 trades per hour
            return UInt64(50)  # Medium suspicion
        else:
            return UInt64(10)  # Low suspicion
    
    @staticmethod
    def validate_anti_manipulation(
        player_returns: UInt64,
        total_pool: UInt64,
        max_return_percentage: UInt64 = UInt64(50)
    ) -> bool:
        """
        Validate returns aren't suspiciously high (anti-manipulation)
        
        Args:
            player_returns: Player's total returns
            total_pool: Total competition pool
            max_return_percentage: Maximum allowed return percentage
            
        Returns:
            True if returns are reasonable, False otherwise
        """
        if total_pool == UInt64(0):
            return True
        
        return_percentage = (player_returns * UInt64(100)) // total_pool
        return return_percentage <= max_return_percentage


class RateLimiter:
    """Rate limiting utilities to prevent spam"""
    
    def __init__(self):
        self.last_trade_time: UInt64 = UInt64(0)
        self.min_trade_interval: UInt64 = UInt64(30)  # 30 seconds between trades
    
    def can_execute_trade(self, current_time: UInt64) -> bool:
        """
        Check if enough time has passed since last trade
        
        Args:
            current_time: Current timestamp
            
        Returns:
            True if trade can be executed, False otherwise
        """
        time_since_last = current_time - self.last_trade_time
        return time_since_last >= self.min_trade_interval
    
    def update_last_trade_time(self, current_time: UInt64) -> None:
        """
        Update the last trade time
        
        Args:
            current_time: Current timestamp
        """
        self.last_trade_time = current_time


class EmergencyControls:
    """Emergency control functions for contract security"""
    
    @staticmethod
    def pause_competition(reason: String) -> String:
        """
        Pause competition in case of emergency
        
        Args:
            reason: Reason for pausing
            
        Returns:
            Confirmation message
        """
        # In a real implementation, this would set a pause flag
        return f"Competition paused: {reason}"
    
    @staticmethod
    def emergency_withdraw(
        player: Account, 
        amount: UInt64, 
        reason: String
    ) -> String:
        """
        Emergency withdrawal function
        
        Args:
            player: Player to withdraw for
            amount: Amount to withdraw
            reason: Reason for emergency withdrawal
            
        Returns:
            Confirmation message
        """
        # In a real implementation, this would handle emergency withdrawals
        return f"Emergency withdrawal of {amount} for {player}: {reason}"
