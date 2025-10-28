"""
FastAPI server for ASA operations
Provides REST API endpoints for asset creation and management
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import os
from asa_service import ASAService

app = FastAPI(title="Algorand ASA API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ASA service
asa_service = ASAService()

# Pydantic models for request/response
class CreateAssetRequest(BaseModel):
    creator_private_key: str
    asset_name: str
    unit_name: str
    total_supply: int
    decimals: int = 0
    default_frozen: bool = False
    url: str = ""
    manager_address: Optional[str] = None
    reserve_address: Optional[str] = None
    freeze_address: Optional[str] = None
    clawback_address: Optional[str] = None

class TransferAssetRequest(BaseModel):
    sender_private_key: str
    receiver_address: str
    asset_id: int
    amount: int

class OptInRequest(BaseModel):
    account_private_key: str
    asset_id: int

class CreateVideoTokenRequest(BaseModel):
    video_id: str
    video_title: str
    total_supply: int = 1000000

class ConvertMnemonicRequest(BaseModel):
    mnemonic: str

@app.get("/")
async def root():
    return {"message": "Algorand ASA API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.post("/create-asset")
async def create_asset(request: CreateAssetRequest):
    """
    Create an Algorand Standard Asset
    """
    try:
        result = asa_service.create_asset(
            creator_private_key=request.creator_private_key,
            asset_name=request.asset_name,
            unit_name=request.unit_name,
            total_supply=request.total_supply,
            decimals=request.decimals,
            default_frozen=request.default_frozen,
            url=request.url,
            manager_address=request.manager_address,
            reserve_address=request.reserve_address,
            freeze_address=request.freeze_address,
            clawback_address=request.clawback_address
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/transfer-asset")
async def transfer_asset(request: TransferAssetRequest):
    """
    Transfer assets between accounts
    """
    try:
        result = asa_service.transfer_asset(
            sender_private_key=request.sender_private_key,
            receiver_address=request.receiver_address,
            asset_id=request.asset_id,
            amount=request.amount
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/opt-in-asset")
async def opt_in_asset(request: OptInRequest):
    """
    Opt-in to receive an asset
    """
    try:
        result = asa_service.opt_in_asset(
            account_private_key=request.account_private_key,
            asset_id=request.asset_id
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create-video-token")
async def create_video_token(request: CreateVideoTokenRequest):
    """
    Create a video token ASA
    """
    try:
        # Use the hardcoded mnemonic to get private key
        from algosdk import mnemonic
        mnemonic_phrase = "clean lend scan box absorb cancel legal wood frost dynamic frequent uphold cluster lake sibling luggage flat unfair runway pole physical receive foam above hat"
        private_key = mnemonic.to_private_key(mnemonic_phrase)
        
        result = asa_service.create_video_token(
            creator_private_key=private_key,
            video_id=request.video_id,
            video_title=request.video_title,
            total_supply=request.total_supply
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/asset-info/{asset_id}")
async def get_asset_info(asset_id: int):
    """
    Get asset information
    """
    try:
        result = asa_service.get_asset_info(asset_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/account-assets/{account_address}")
async def get_account_assets(account_address: str):
    """
    Get all assets owned by an account
    """
    try:
        result = asa_service.get_account_assets(account_address)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/convert-mnemonic")
async def convert_mnemonic(request: ConvertMnemonicRequest):
    """
    Convert mnemonic phrase to private key and address
    """
    try:
        from algosdk import mnemonic, account
        
        # Convert mnemonic to private key
        private_key = mnemonic.to_private_key(request.mnemonic)
        address = account.address_from_private_key(private_key)
        
        return {
            "success": True,
            "data": {
                "private_key": private_key,
                "address": address
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
