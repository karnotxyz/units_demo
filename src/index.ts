import dotenv from "dotenv";
dotenv.config();

import contracts from "../contracts.json";
import { getStarknetAccount, getUnitsAccount, getUnitsProvider } from "./utils";

import { getChainId } from "units-sdk";
import { num } from "starknet";


async function main() {
    const unitsAccount = getUnitsAccount();
    const unitsProvider = getUnitsProvider();

    const chainId = await getChainId(unitsProvider);
    console.log("Chain ID:", Buffer.from(chainId.chain_id.slice(2), "hex").toString());

    const starknetAccount = getStarknetAccount();
}

main();