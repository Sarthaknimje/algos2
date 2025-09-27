"""
Rewards and payout system for Algo Premier League
"""

from algopy import ARC4Contract, String, UInt64, GlobalState, LocalState, Account, Txn, Global
from algopy.arc4 import abimethod, DynamicArray


class RewardsSystem(ARC4Contract):
    """Rewards and payout management for competitions"""
    
    # Global reward state
    total_rewards_pool: GlobalState[UInt64]
    winner_rewards: GlobalState[UInt64]
    participation_rewards: GlobalState[UInt64]
    bonus_rewards: GlobalState[UInt64]
    
    # Reward distribution
    winner_multiplier: GlobalState[UInt64]  # 2x for winner
    top_3_multiplier: GlobalState[UInt64]   # 1.5x for top 3
    participation_multiplier: GlobalState[UInt64]  # 1.1x for all participants
    
    # Player reward state
    player_claimed: LocalState[bool]
    player_reward_amount: LocalState[UInt64]
    player_rank: LocalState[UInt64]
    player_claim_time: LocalState[UInt64]
    
    def __init__(self) -> None:
        """Initialize rewards system"""
        self.total_rewards_pool = GlobalState(UInt64(0))
        self.winner_rewards = GlobalState(UInt64(0))
        self.participation_rewards = GlobalState(UInt64(0))
        self.bonus_rewards = GlobalState(UInt64(0))
        
        self.winner_multiplier = GlobalState(UInt64(200))  # 2x = 200%
        self.top_3_multiplier = GlobalState(UInt64(150))   # 1.5x = 150%
        self.participation_multiplier = GlobalState(UInt64(110))  # 1.1x = 110%
        
        self.player_claimed = LocalState(False)
        self.player_reward_amount = LocalState(UInt64(0))
        self.player_rank = LocalState(UInt64(0))
        self.player_claim_time = LocalState(UInt64(0))
    
    @abimethod()
    def calculate_rewards(
        self,
        total_pool: UInt64,
        player_count: UInt64
    ) -> String:
        """Calculate reward distribution for competition
        
        Args:
            total_pool: Total competition pool
            player_count: Number of participants
            
        Returns:
            Reward calculation confirmation
        """
        # Only creator can calculate rewards
        assert Txn.sender == Global.creator_address, "Only creator can calculate rewards"
        
        # Validate inputs
        assert total_pool > UInt64(0), "Invalid total pool"
        assert player_count > UInt64(0), "Invalid player count"
        
        # Calculate reward distribution
        # Winner gets 50% of pool with 2x multiplier
        winner_base = total_pool // UInt64(2)
        self.winner_rewards = GlobalState(winner_base * self.winner_multiplier.value // UInt64(100))
        
        # Top 3 get 30% of pool with 1.5x multiplier
        top_3_base = (total_pool * UInt64(30)) // UInt64(100)
        top_3_rewards = top_3_base * self.top_3_multiplier.value // UInt64(100)
        
        # Participation rewards for all players (20% of pool)
        participation_base = (total_pool * UInt64(20)) // UInt64(100)
        self.participation_rewards = GlobalState(participation_base * self.participation_multiplier.value // UInt64(100))
        
        # Calculate total rewards
        total_rewards = self.winner_rewards.value + top_3_rewards + self.participation_rewards.value
        self.total_rewards_pool = GlobalState(total_rewards)
        
        return f"Rewards calculated: Winner={self.winner_rewards.value}, Top3={top_3_rewards}, Participation={self.participation_rewards.value}"
    
    @abimethod()
    def set_player_rank(
        self,
        player: Account,
        rank: UInt64,
        total_value: UInt64
    ) -> String:
        """Set player rank and calculate their reward
        
        Args:
            player: Player account
            rank: Player's final rank
            total_value: Player's total portfolio value
            
        Returns:
            Rank setting confirmation
        """
        # Only creator can set ranks
        assert Txn.sender == Global.creator_address, "Only creator can set ranks"
        
        # Validate rank
        assert rank > UInt64(0), "Invalid rank"
        
        # Calculate reward based on rank
        reward_amount = UInt64(0)
        
        if rank == UInt64(1):  # Winner
            reward_amount = self.winner_rewards.value
        elif rank <= UInt64(3):  # Top 3
            # Distribute top 3 rewards equally
            top_3_total = (self.total_rewards_pool.value - self.winner_rewards.value - self.participation_rewards.value)
            reward_amount = top_3_total // UInt64(2)  # Split between 2nd and 3rd
        else:  # Participation reward
            reward_amount = self.participation_rewards.value
        
        # Update player state (this would be done for each player)
        # For demo, we'll just return the calculation
        return f"Player {player} rank {rank}: {reward_amount} microALGOs reward"
    
    @abimethod()
    def claim_rewards(self) -> String:
        """Claim rewards for the calling player
        
        Returns:
            Claim confirmation
        """
        # Check if player has rewards to claim
        assert self.player_reward_amount.value > UInt64(0), "No rewards to claim"
        assert not self.player_claimed.value, "Rewards already claimed"
        
        # Check if competition has ended
        # In a real implementation, would check competition end time
        current_time = Global.latest_timestamp
        
        # Transfer rewards to player
        reward_amount = self.player_reward_amount.value
        
        InnerTxnBuilder.Begin()
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender,
            TxnField.amount: reward_amount,
            TxnField.sender: Global.current_application_address,
        })
        InnerTxnBuilder.Submit()
        
        # Update player state
        self.player_claimed = LocalState(True)
        self.player_claim_time = LocalState(current_time)
        
        return f"🎉 Rewards claimed: {reward_amount} microALGOs!"
    
    @abimethod()
    def get_reward_info(self) -> String:
        """Get reward information for the calling player
        
        Returns:
            Reward information
        """
        if self.player_reward_amount.value == UInt64(0):
            return "No rewards available"
        
        claimed_status = "Claimed" if self.player_claimed.value else "Available"
        rank = self.player_rank.value
        amount = self.player_reward_amount.value
        
        return f"Rank: {rank} | Reward: {amount} microALGOs | Status: {claimed_status}"
    
    @abimethod()
    def add_bonus_rewards(
        self,
        bonus_amount: UInt64,
        reason: String
    ) -> String:
        """Add bonus rewards to the pool
        
        Args:
            bonus_amount: Amount of bonus rewards
            reason: Reason for bonus
            
        Returns:
            Bonus addition confirmation
        """
        # Only creator can add bonus rewards
        assert Txn.sender == Global.creator_address, "Only creator can add bonus rewards"
        
        # Transfer bonus to contract
        InnerTxnBuilder.Begin()
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Global.current_application_address,
            TxnField.amount: bonus_amount,
            TxnField.sender: Txn.sender,
        })
        InnerTxnBuilder.Submit()
        
        # Update bonus rewards
        self.bonus_rewards = GlobalState(self.bonus_rewards.value + bonus_amount)
        self.total_rewards_pool = GlobalState(self.total_rewards_pool.value + bonus_amount)
        
        return f"Bonus rewards added: {bonus_amount} microALGOs - {reason} 🎁"
    
    @abimethod()
    def emergency_withdraw_rewards(
        self,
        player: Account,
        amount: UInt64,
        reason: String
    ) -> String:
        """Emergency withdrawal of rewards
        
        Args:
            player: Player to withdraw for
            amount: Amount to withdraw
            reason: Reason for emergency withdrawal
            
        Returns:
            Withdrawal confirmation
        """
        # Only creator can perform emergency withdrawals
        assert Txn.sender == Global.creator_address, "Only creator can perform emergency withdrawals"
        
        # Transfer rewards to player
        InnerTxnBuilder.Begin()
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: player,
            TxnField.amount: amount,
            TxnField.sender: Global.current_application_address,
        })
        InnerTxnBuilder.Submit()
        
        return f"Emergency withdrawal: {amount} microALGOs to {player} - {reason} 🚨"
    
    @abimethod()
    def get_total_rewards_info(self) -> String:
        """Get total rewards pool information
        
        Returns:
            Rewards pool information
        """
        total = self.total_rewards_pool.value
        winner = self.winner_rewards.value
        participation = self.participation_rewards.value
        bonus = self.bonus_rewards.value
        
        return f"Total Pool: {total} | Winner: {winner} | Participation: {participation} | Bonus: {bonus}"
