"""
Algorand Standard Assets (ASA) Service
Following official Algorand documentation patterns
"""

from algosdk import transaction, mnemonic, account
from algosdk.v2client import algod
import json
import base64
from typing import Dict, Any, Optional, Tuple

class ASAService:
    def __init__(self, algod_token: str = "", algod_address: str = "https://testnet-api.algonode.cloud", algod_port: str = ""):
        """
        Initialize ASA Service with Algorand client
        """
        self.algod_client = algod.AlgodClient(algod_token, algod_address, algod_port)
        
    def create_asset(
        self,
        creator_private_key: str,
        asset_name: str,
        unit_name: str,
        total_supply: int,
        decimals: int = 0,
        default_frozen: bool = False,
        url: str = "",
        metadata_hash: Optional[bytes] = None,
        manager_address: Optional[str] = None,
        reserve_address: Optional[str] = None,
        freeze_address: Optional[str] = None,
        clawback_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create an Algorand Standard Asset following official documentation
        
        Args:
            creator_private_key: Private key of the creator account
            asset_name: Name of the asset
            unit_name: Unit name of the asset
            total_supply: Total supply of the asset
            decimals: Number of decimals
            default_frozen: Whether the asset is frozen by default
            url: URL for asset metadata
            metadata_hash: Hash of asset metadata
            manager_address: Address that can manage the asset
            reserve_address: Address that holds non-minted assets
            freeze_address: Address that can freeze/unfreeze assets
            clawback_address: Address that can clawback assets
            
        Returns:
            Dictionary containing asset_id, transaction_id, and asset info
        """
        try:
            # Get creator address from private key
            creator_address = account.address_from_private_key(creator_private_key)
            
            # Set default addresses to creator if not provided
            if manager_address is None:
                manager_address = creator_address
            if reserve_address is None:
                reserve_address = creator_address
            if freeze_address is None:
                freeze_address = creator_address
            if clawback_address is None:
                clawback_address = creator_address
            
            # Get suggested parameters
            sp = self.algod_client.suggested_params()
            
            # Create asset creation transaction following official documentation
            txn = transaction.AssetConfigTxn(
                sender=creator_address,
                sp=sp,
                default_frozen=default_frozen,
                unit_name=unit_name,
                asset_name=asset_name,
                manager=manager_address,
                reserve=reserve_address,
                freeze=freeze_address,
                clawback=clawback_address,
                url=url,
                total=total_supply,
                decimals=decimals,
                metadata_hash=metadata_hash
            )
            
            # Sign transaction with creator's private key
            stxn = txn.sign(creator_private_key)
            
            # Send transaction to network
            txid = self.algod_client.send_transaction(stxn)
            print(f"Sent asset create transaction with txid: {txid}")
            
            # Wait for confirmation
            results = transaction.wait_for_confirmation(self.algod_client, txid, 4)
            print(f"Result confirmed in round: {results['confirmed-round']}")
            
            # Get asset ID
            created_asset = results["asset-index"]
            print(f"Asset ID created: {created_asset}")
            
            return {
                "asset_id": created_asset,
                "transaction_id": txid,
                "creator": creator_address,
                "total_supply": total_supply,
                "decimals": decimals,
                "unit_name": unit_name,
                "asset_name": asset_name,
                "url": url,
                "manager": manager_address,
                "reserve": reserve_address,
                "freeze": freeze_address,
                "clawback": clawback_address
            }
            
        except Exception as e:
            print(f"Error creating asset: {e}")
            raise e
    
    def transfer_asset(
        self,
        sender_private_key: str,
        receiver_address: str,
        asset_id: int,
        amount: int
    ) -> Dict[str, Any]:
        """
        Transfer assets between accounts following official documentation
        
        Args:
            sender_private_key: Private key of sender
            receiver_address: Address of receiver
            asset_id: ID of asset to transfer
            amount: Amount to transfer
            
        Returns:
            Dictionary containing transaction_id and amount
        """
        try:
            sender_address = account.address_from_private_key(sender_private_key)
            
            # Get suggested parameters
            sp = self.algod_client.suggested_params()
            
            # Create asset transfer transaction
            xfer_txn = transaction.AssetTransferTxn(
                sender=sender_address,
                sp=sp,
                receiver=receiver_address,
                amt=amount,
                index=asset_id,
            )
            
            # Sign transaction
            signed_xfer_txn = xfer_txn.sign(sender_private_key)
            
            # Send transaction
            txid = self.algod_client.send_transaction(signed_xfer_txn)
            print(f"Sent transfer transaction with txid: {txid}")
            
            # Wait for confirmation
            results = transaction.wait_for_confirmation(self.algod_client, txid, 4)
            print(f"Result confirmed in round: {results['confirmed-round']}")
            
            return {
                "transaction_id": txid,
                "amount": amount,
                "asset_id": asset_id,
                "sender": sender_address,
                "receiver": receiver_address
            }
            
        except Exception as e:
            print(f"Error transferring asset: {e}")
            raise e
    
    def opt_in_asset(
        self,
        account_private_key: str,
        asset_id: int
    ) -> Dict[str, Any]:
        """
        Opt-in to receive an asset following official documentation
        
        Args:
            account_private_key: Private key of account opting in
            asset_id: ID of asset to opt-in to
            
        Returns:
            Dictionary containing transaction_id
        """
        try:
            account_address = account.address_from_private_key(account_private_key)
            
            # Get suggested parameters
            sp = self.algod_client.suggested_params()
            
            # Create opt-in transaction
            optin_txn = transaction.AssetOptInTxn(
                sender=account_address,
                sp=sp,
                index=asset_id
            )
            
            # Sign transaction
            signed_optin_txn = optin_txn.sign(account_private_key)
            
            # Send transaction
            txid = self.algod_client.send_transaction(signed_optin_txn)
            print(f"Sent opt in transaction with txid: {txid}")
            
            # Wait for confirmation
            results = transaction.wait_for_confirmation(self.algod_client, txid, 4)
            print(f"Result confirmed in round: {results['confirmed-round']}")
            
            return {
                "transaction_id": txid,
                "account": account_address,
                "asset_id": asset_id
            }
            
        except Exception as e:
            print(f"Error opting in to asset: {e}")
            raise e
    
    def get_asset_info(self, asset_id: int) -> Dict[str, Any]:
        """
        Get asset information following official documentation
        
        Args:
            asset_id: ID of asset to get info for
            
        Returns:
            Dictionary containing asset information
        """
        try:
            asset_info = self.algod_client.asset_info(asset_id)
            asset_params = asset_info["params"]
            
            return {
                "asset_id": asset_id,
                "name": asset_params.get('name', ''),
                "unit_name": asset_params.get('unit-name', ''),
                "total": asset_params.get('total', 0),
                "decimals": asset_params.get('decimals', 0),
                "creator": asset_params.get('creator', ''),
                "manager": asset_params.get('manager', ''),
                "reserve": asset_params.get('reserve', ''),
                "freeze": asset_params.get('freeze', ''),
                "clawback": asset_params.get('clawback', ''),
                "url": asset_params.get('url', ''),
                "default_frozen": asset_params.get('default-frozen', False)
            }
            
        except Exception as e:
            print(f"Error getting asset info: {e}")
            raise e
    
    def get_account_assets(self, account_address: str) -> list:
        """
        Get all assets owned by an account
        
        Args:
            account_address: Address of account
            
        Returns:
            List of asset holdings
        """
        try:
            account_info = self.algod_client.account_info(account_address)
            return account_info.get('assets', [])
            
        except Exception as e:
            print(f"Error getting account assets: {e}")
            raise e
    
    def create_video_token(
        self,
        creator_private_key: str,
        video_id: str,
        video_title: str,
        total_supply: int = 1000000
    ) -> Dict[str, Any]:
        """
        Create a video token ASA with proper parameters
        
        Args:
            creator_private_key: Private key of creator
            video_id: YouTube video ID
            video_title: Title of the video
            total_supply: Total supply of tokens
            
        Returns:
            Dictionary containing token information
        """
        try:
            # Prepare asset parameters
            unit_name = video_id[:8].upper()
            asset_name = video_title[:32].replace('[^a-zA-Z0-9\\s]', '')
            metadata_url = f"https://socialcoin.app/video/{video_id}"
            
            # Create the asset
            result = self.create_asset(
                creator_private_key=creator_private_key,
                asset_name=asset_name,
                unit_name=unit_name,
                total_supply=total_supply,
                decimals=0,
                default_frozen=False,
                url=metadata_url
            )
            
            # Add video-specific information
            result.update({
                "video_id": video_id,
                "video_title": video_title,
                "video_url": metadata_url,
                "minted_supply": total_supply,  # Full supply is minted to creator
                "current_price": 1000  # Initial price in microAlgos
            })
            
            return result
            
        except Exception as e:
            print(f"Error creating video token: {e}")
            raise e

# Example usage
if __name__ == "__main__":
    # Initialize service
    asa_service = ASAService()
    
    # Example: Create a video token
    # Note: Replace with actual private key
    creator_private_key = "your_private_key_here"
    
    try:
        token_info = asa_service.create_video_token(
            creator_private_key=creator_private_key,
            video_id="LttPjGraLJU",
            video_title="Red Light Green Light",
            total_supply=1000000
        )
        
        print("Video token created successfully:")
        print(json.dumps(token_info, indent=2))
        
    except Exception as e:
        print(f"Failed to create video token: {e}")
