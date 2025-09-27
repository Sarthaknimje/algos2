import logging
import time

import algokit_utils

logger = logging.getLogger(__name__)


# define deployment behaviour based on supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.algo.algo_client import (
        InitializeCompetitionArgs,
        JoinCompetitionArgs,
        GetCompetitionInfoArgs,
        AlgoPremierLeagueFactory,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        AlgoPremierLeagueFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        # Fund the contract with 10 ALGOs for the competition pool
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=10),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    # Initialize the Algo Premier League competition
    current_time = int(time.time())
    start_time = current_time + 60  # Start in 1 minute
    end_time = current_time + 3600  # End in 1 hour
    entry_fee = 1000000  # 1 ALGO in microALGOs
    
    response = app_client.send.initialize_competition(
        args=InitializeCompetitionArgs(
            start_time=start_time,
            end_time=end_time,
            entry_fee=entry_fee
        )
    )
    logger.info(
        f"Initialized Algo Premier League competition: {response.abi_return}"
    )
    
    # Get competition info
    info_response = app_client.send.get_competition_info(
        args=GetCompetitionInfoArgs()
    )
    logger.info(f"Competition Info: {info_response.abi_return}")
    
    logger.info(
        f"🏆 Algo Premier League deployed successfully!"
        f"\nContract Address: {app_client.app_address}"
        f"\nApp ID: {app_client.app_id}"
        f"\nCompetition starts in 1 minute and runs for 1 hour"
        f"\nEntry fee: 1 ALGO"
        f"\nWinner gets 2x rewards!"
    )
