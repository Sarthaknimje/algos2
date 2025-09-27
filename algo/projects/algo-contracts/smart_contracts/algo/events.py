"""
Event definitions for Algo Premier League smart contract
"""

from algopy import ARC4Contract, String, UInt64, Account, Asset
from algopy.arc4 import abimethod, abievent


class AlgoPremierLeagueEvents(ARC4Contract):
    """Event definitions for the Algo Premier League contract"""
    
    # Competition Events
    @abievent
    def CompetitionInitialized(
        self,
        start_time: UInt64,
        end_time: UInt64,
        entry_fee: UInt64,
        creator: Account
    ) -> None:
        """Emitted when competition is initialized"""
        pass
    
    @abievent
    def PlayerJoined(
        self,
        player: Account,
        entry_fee: UInt64,
        total_players: UInt64
    ) -> None:
        """Emitted when a player joins the competition"""
        pass
    
    @abievent
    def TradeExecuted(
        self,
        player: Account,
        asset: Asset,
        trade_type: String,
        amount: UInt64,
        return_amount: UInt64,
        timestamp: UInt64
    ) -> None:
        """Emitted when a trade is executed"""
        pass
    
    @abievent
    def CompetitionEnded(
        self,
        winner: Account,
        total_pool: UInt64,
        reward_amount: UInt64
    ) -> None:
        """Emitted when competition ends"""
        pass
    
    @abievent
    def RewardsClaimed(
        self,
        winner: Account,
        reward_amount: UInt64,
        timestamp: UInt64
    ) -> None:
        """Emitted when winner claims rewards"""
        pass
    
    @abievent
    def PlayerStatsUpdated(
        self,
        player: Account,
        balance: UInt64,
        returns: UInt64,
        total_value: UInt64,
        trade_count: UInt64
    ) -> None:
        """Emitted when player statistics are updated"""
        pass
    
    @abievent
    def AssetPriceUpdated(
        self,
        asset: Asset,
        price: UInt64,
        timestamp: UInt64
    ) -> None:
        """Emitted when asset price is updated"""
        pass
    
    @abievent
    def CompetitionPaused(
        self,
        reason: String,
        timestamp: UInt64
    ) -> None:
        """Emitted when competition is paused"""
        pass
    
    @abievent
    def CompetitionResumed(
        self,
        timestamp: UInt64
    ) -> None:
        """Emitted when competition is resumed"""
        pass
    
    @abievent
    def EmergencyWithdraw(
        self,
        player: Account,
        amount: UInt64,
        reason: String
    ) -> None:
        """Emitted during emergency withdrawal"""
        pass


# Event helper functions
def emit_competition_initialized(
    start_time: UInt64,
    end_time: UInt64,
    entry_fee: UInt64,
    creator: Account
) -> None:
    """Helper function to emit competition initialized event"""
    AlgoPremierLeagueEvents().CompetitionInitialized(
        start_time=start_time,
        end_time=end_time,
        entry_fee=entry_fee,
        creator=creator
    )


def emit_player_joined(
    player: Account,
    entry_fee: UInt64,
    total_players: UInt64
) -> None:
    """Helper function to emit player joined event"""
    AlgoPremierLeagueEvents().PlayerJoined(
        player=player,
        entry_fee=entry_fee,
        total_players=total_players
    )


def emit_trade_executed(
    player: Account,
    asset: Asset,
    trade_type: String,
    amount: UInt64,
    return_amount: UInt64,
    timestamp: UInt64
) -> None:
    """Helper function to emit trade executed event"""
    AlgoPremierLeagueEvents().TradeExecuted(
        player=player,
        asset=asset,
        trade_type=trade_type,
        amount=amount,
        return_amount=return_amount,
        timestamp=timestamp
    )


def emit_competition_ended(
    winner: Account,
    total_pool: UInt64,
    reward_amount: UInt64
) -> None:
    """Helper function to emit competition ended event"""
    AlgoPremierLeagueEvents().CompetitionEnded(
        winner=winner,
        total_pool=total_pool,
        reward_amount=reward_amount
    )


def emit_rewards_claimed(
    winner: Account,
    reward_amount: UInt64,
    timestamp: UInt64
) -> None:
    """Helper function to emit rewards claimed event"""
    AlgoPremierLeagueEvents().RewardsClaimed(
        winner=winner,
        reward_amount=reward_amount,
        timestamp=timestamp
    )
