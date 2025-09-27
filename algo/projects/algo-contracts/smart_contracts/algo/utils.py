"""
Utility functions for Algo Premier League smart contract
"""

from algopy import UInt64, Asset, String


def calculate_trade_return(amount: UInt64, asset: Asset, trade_type: String) -> UInt64:
    """
    Calculate simulated trade returns based on asset and trade type
    
    Args:
        amount: Trade amount in microALGOs
        asset: Asset being traded
        trade_type: "BUY" or "SELL"
        
    Returns:
        Calculated return amount
    """
    # Simulate different returns based on asset volatility
    asset_multipliers = {
        # High volatility assets get higher potential returns
        "BTC": 8,   # 8% return
        "ETH": 7,   # 7% return
        "SOL": 6,   # 6% return
        "AVAX": 5,  # 5% return
        "DOT": 4,   # 4% return
        "ADA": 3,   # 3% return
        "LINK": 3,  # 3% return
        "MATIC": 2, # 2% return
        "ALGO": 2,  # 2% return
        "USDC": 1,  # 1% return
        "USDT": 1,  # 1% return
    }
    
    # Get multiplier for the asset (default to 2% if not found)
    multiplier = asset_multipliers.get(str(asset), 2)
    
    # Calculate return based on trade type
    if trade_type == "BUY":
        # Buy trades get the full multiplier
        return_amount = amount + (amount * UInt64(multiplier) // UInt64(100))
    else:  # SELL
        # Sell trades get half the multiplier (simulating market impact)
        return_amount = amount + (amount * UInt64(multiplier // 2) // UInt64(100))
    
    return return_amount


def validate_trade_amount(amount: UInt64, min_amount: UInt64 = UInt64(100000)) -> bool:
    """
    Validate if trade amount meets minimum requirements
    
    Args:
        amount: Trade amount to validate
        min_amount: Minimum allowed amount (default 0.1 ALGO)
        
    Returns:
        True if valid, False otherwise
    """
    return amount >= min_amount


def calculate_competition_rank(player_returns: UInt64, total_players: UInt64) -> UInt64:
    """
    Calculate player rank based on returns (simplified version)
    
    Args:
        player_returns: Player's total returns
        total_players: Total number of players
        
    Returns:
        Player rank (1 = best)
    """
    # This is a simplified ranking - in a real implementation,
    # you would need to compare against all players
    if player_returns >= UInt64(5000000):  # 5+ ALGO returns
        return UInt64(1)  # Top rank
    elif player_returns >= UInt64(3000000):  # 3+ ALGO returns
        return UInt64(2)  # Second rank
    elif player_returns >= UInt64(1000000):  # 1+ ALGO returns
        return UInt64(3)  # Third rank
    else:
        return UInt64(4)  # Lower rank


def format_algo_amount(micro_algos: UInt64) -> String:
    """
    Format microALGOs to ALGO string representation
    
    Args:
        micro_algos: Amount in microALGOs
        
    Returns:
        Formatted string (e.g., "1.50 ALGO")
    """
    algos = micro_algos // UInt64(1000000)
    remainder = micro_algos % UInt64(1000000)
    
    if remainder == UInt64(0):
        return String(f"{algos}.00 ALGO")
    else:
        # Convert remainder to decimal (simplified)
        decimal = remainder // UInt64(10000)  # 2 decimal places
        return String(f"{algos}.{decimal:02d} ALGO")


def get_asset_volatility(asset: Asset) -> UInt64:
    """
    Get volatility score for an asset (used for risk calculation)
    
    Args:
        asset: Asset to get volatility for
        
    Returns:
        Volatility score (1-10, 10 being most volatile)
    """
    volatility_scores = {
        "BTC": UInt64(8),
        "ETH": UInt64(7),
        "SOL": UInt64(9),
        "AVAX": UInt64(8),
        "DOT": UInt64(6),
        "ADA": UInt64(5),
        "LINK": UInt64(5),
        "MATIC": UInt64(4),
        "ALGO": UInt64(3),
        "USDC": UInt64(1),
        "USDT": UInt64(1),
    }
    
    return volatility_scores.get(str(asset), UInt64(5))  # Default to medium volatility
