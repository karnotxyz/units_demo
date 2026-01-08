# Units Bridge Demo

A demonstration of cross-chain token bridging between Starknet (L2) and Units Network (L3).

## What It Does

This demo:

1. Deposits ETH from Starknet to Units Network
2. Transfers tokens within Units Network
3. Withdraws tokens back to Starknet

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create a `.env` file with your account details:

   ```env
   # Starknet (L2) Configuration
   STARKNET_RPC=https://..,
   STARKNET_ACCOUNT_ADDRESS=0x...
   STARKNET_PRIVATE_KEY=0x...

   # Units (L3) Configuration
   UNITS_RPC=https://...
   UNITS_ACCOUNT_ADDRESS=0x...
   UNITS_PRIVATE_KEY=0x...
   ```

## Requirements

- **STARKNET Account**: Must have at least **2 wei of ETH** (plus gas fees)
- **UNITS Account**: Use any account on Units Network (does not need to be pre-funded)

## Run

```bash
bun run src/index.ts
```
