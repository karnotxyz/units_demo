import dotenv from "dotenv";
dotenv.config();

import contracts from "../contracts.json";
import { getStarknetAccount, getUnitsAccount, getUnitsProvider, sleep } from "./utils";

import { getChainId, call, sendTransaction } from "units-sdk";
import { num, uint256 } from "starknet";

const ETH_ADDRESS = contracts.contracts.l2.ETH;
const L2_TOKEN_BRIDGE = contracts.contracts.l2.TokenBridge;
const L3_TOKEN_BRIDGE = contracts.contracts.l3.TokenBridge;
const APPCHAIN_ADDRESS = contracts.contracts.l2.appchain;


async function main() {
    const unitsAccount = getUnitsAccount();
    const unitsProvider = getUnitsProvider();

    const chainId = await getChainId(unitsProvider);
    console.log("Chain ID:", Buffer.from(chainId.chain_id.slice(2), "hex").toString());

    const starknetAccount = getStarknetAccount();
    const unitsAccountAddress = unitsAccount.getAddress();
    const starknetAccountAddress = starknetAccount.address;

    // Amount to deposit
    const depositAmount = BigInt("2"); 
    const depositAmountU256 = uint256.bnToUint256(depositAmount);

    // Step 1: Approve TokenBridge to spend ETH and then deposit
    // deposit(token, amount, appchain_recipient)
    console.log("\n=== Step 1: Approving and Depositing ETH on L2 TokenBridge ===");
    console.log(`Token: ${ETH_ADDRESS}`);
    console.log(`Amount: ${depositAmount.toString()} wei`);
    console.log(`Appchain Recipient: ${unitsAccountAddress}`);

    const depositTx = await starknetAccount.execute([
        {
            contractAddress: ETH_ADDRESS,
            entrypoint: "approve",
            calldata: [
                L2_TOKEN_BRIDGE,       // spender
                depositAmountU256.low, // amount (u256 low)
                depositAmountU256.high // amount (u256 high)
            ]
        },
        {
            contractAddress: L2_TOKEN_BRIDGE,
            entrypoint: "deposit",
            calldata: [
                ETH_ADDRESS,           // token
                depositAmountU256.low, // amount (u256 low)
                depositAmountU256.high, // amount (u256 high)
                unitsAccountAddress    // appchain_recipient
            ]
        }
    ]);
    console.log("Deposit transaction hash:", depositTx.transaction_hash);
    console.log("Waiting for deposit transaction to be confirmed...");
    await starknetAccount.waitForTransaction(depositTx.transaction_hash);
    console.log("Deposit transaction confirmed!");

    // Step 2: Wait for a few seconds for the deposit to be processed
    console.log("\n=== Step 2: Waiting for deposit to be processed ===");
    const waitTimeSeconds = 60;
    console.log(`Waiting ${waitTimeSeconds} seconds...`);
    // await sleep(waitTimeSeconds * 1000);

    // Step 3: Check the corresponding L3 token address for ETH using get_l2_token on L3 TokenBridge
    console.log("\n=== Step 3: Getting L3 token address for ETH ===");
    const l3TokenResult = await call(
        unitsAccount,
        L3_TOKEN_BRIDGE,
        "get_l2_token",
        [ETH_ADDRESS]
    );
    const l3TokenAddress = l3TokenResult.result[2];
    console.log("L3 Token Address for ETH:", l3TokenAddress);

    // Step 4: Check the balance of unitsAccount for the L3 token
    console.log("\n=== Step 4: Checking balance on Units ===");
    const balanceResult = await call(
        unitsAccount,
        l3TokenAddress,
        "balanceOf",
        [unitsAccountAddress]
    );
    const balance = uint256.uint256ToBN({ low: balanceResult.result[0], high: balanceResult.result[1] });
    console.log(`Balance of ${unitsAccountAddress}: ${balance.toString()} wei`);

    // Step 5: Transfer half of the token to another account
    console.log("\n=== Step 5: Transferring half of the tokens ===");
    const recipientAddress = L3_TOKEN_BRIDGE;
    const transferAmount = 1;
    const transferAmountU256 = uint256.bnToUint256(transferAmount);

    console.log(`Transferring ${transferAmount.toString()} wei to ${recipientAddress}`);
    const transferResult = await sendTransaction(
        unitsAccount,
        l3TokenAddress,
        "transfer",
        [
            recipientAddress,
            transferAmountU256.low.toString(),
            transferAmountU256.high.toString()
        ]
    );
    console.log("Transfer transaction hash:", transferResult.tx.transaction_hash);
    console.log("Transfer receipt status:", JSON.stringify(transferResult.receipt.finality_status, null, 2));

    // Step 6: Initiate withdrawal of ETH token
    console.log("\n=== Step 6: Initiating withdrawal ===");
    const withdrawAmount = transferAmount; // Withdraw the remaining half
    const withdrawAmountU256 = uint256.bnToUint256(withdrawAmount);

    console.log(`Withdrawing ${withdrawAmount.toString()} wei to ${starknetAccountAddress}`);
    const withdrawResult = await sendTransaction(
        unitsAccount,
        L3_TOKEN_BRIDGE,
        "initiate_token_withdraw",
        [
            ETH_ADDRESS,             // l1_token
            starknetAccountAddress,  // l1_recipient
            withdrawAmountU256.low.toString(),  // amount (u256 low)
            withdrawAmountU256.high.toString()  // amount (u256 high)
        ]
    );
    console.log("Withdraw transaction hash:", withdrawResult.tx.transaction_hash);
    console.log("Withdraw receipt status:", JSON.stringify(withdrawResult.receipt.finality_status, null, 2));

    console.log("\n=== Demo completed successfully! ===");
}

main();