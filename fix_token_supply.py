#!/usr/bin/env python3

import requests
import json
from algosdk import account, mnemonic, transaction
from algosdk.v2client import algod

# Algorand configuration
ALGOD_TOKEN = ""
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
CREATOR_MNEMONIC = "alter green actual grab spoon okay faith repeat smile report easily retire plate enact vacuum spin bachelor rate where service settle nice north above soul"

# Initialize client
algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

# Get creator account
private_key = mnemonic.to_private_key(CREATOR_MNEMONIC)
creator_address = account.address_from_private_key(private_key)

print(f"Creator address: {creator_address}")

# Get account info
account_info = algod_client.account_info(creator_address)
assets = account_info.get('assets', [])

print(f"Found {len(assets)} assets")

# Transfer tokens for each asset
for asset in assets:
    asset_id = asset['asset-id']
    current_amount = asset['amount']
    
    print(f"\nAsset ID: {asset_id}")
    print(f"Current amount: {current_amount} micro-units ({current_amount/1000000} tokens)")
    
    # Only transfer if amount is less than 1000000 (1 token)
    if current_amount < 1000000:
        print("Skipping - already has full supply")
        continue
    
    # Get asset info to find total supply
    try:
        asset_info = algod_client.asset_info(asset_id)
        total_supply = asset_info['params']['total']
        print(f"Total supply: {total_supply} micro-units ({total_supply/1000000} tokens)")
        
        # Calculate amount to transfer (total supply - current amount)
        amount_to_transfer = total_supply - current_amount
        
        if amount_to_transfer > 0:
            print(f"Transferring {amount_to_transfer} micro-units ({amount_to_transfer/1000000} tokens)")
            
            # Create transfer transaction
            sp = algod_client.suggested_params()
            transfer_txn = transaction.AssetTransferTxn(
                sender=creator_address,  # Reserve address
                sp=sp,
                receiver=creator_address,  # Creator account
                amt=amount_to_transfer,
                index=asset_id
            )
            
            signed_transfer = transfer_txn.sign(private_key)
            transfer_txid = algod_client.send_transaction(signed_transfer)
            print(f"Transfer transaction sent: {transfer_txid}")
            
            # Wait for confirmation
            transfer_results = transaction.wait_for_confirmation(algod_client, transfer_txid, 4)
            print(f"Transfer confirmed in round: {transfer_results['confirmed-round']}")
        else:
            print("No transfer needed - creator already has full supply")
            
    except Exception as e:
        print(f"Error processing asset {asset_id}: {e}")

print("\n✅ Token supply fix completed!")
