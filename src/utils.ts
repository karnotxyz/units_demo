import { Account, BlockTag, RpcProvider } from "starknet";
import { UnitsAccount, UnitsProvider } from "units-sdk";

// Helper to sleep for a given number of milliseconds
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStarknetAccount() {
    const privateKey = process.env.STARKNET_PRIVATE_KEY as string;
    const address: string = process.env.STARKNET_ACCOUNT_ADDRESS as string;
    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC as string, retries: 5, blockIdentifier: BlockTag.PRE_CONFIRMED });
    return new Account({ provider, address, signer: privateKey });
}

export function getUnitsProvider() {
    return new UnitsProvider(process.env.UNITS_RPC!);
}

export function getUnitsAccount() {
    let unitsProvider = getUnitsProvider();
    return new UnitsAccount(
        unitsProvider,
        process.env.UNITS_ACCOUNT_ADDRESS!,
        process.env.UNITS_PRIVATE_KEY!
    );
}