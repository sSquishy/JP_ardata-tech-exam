# Tier 3 - Smart Contract Development

## Overview
This branch contains the Tier 3 submission for the Full Stack Developer Tech Exam. 
The goal was to create a simple ERC-20 smart contract using Solidity and OpenZeppelin libraries 
that allows minting tokens and transferring them between users.

## Contract
**SimpleToken.sol** - ERC-20 token contract with the following features:
- Mint new tokens to the caller's address
- Transfer tokens between addresses (built-in ERC20)
- Owner management via OpenZeppelin Ownable

## Tools & Environment
- Solidity 0.8.20
- Remix IDE for development and deployment
- OpenZeppelin Contracts library (ERC20, Ownable)
- Sepolia Testnet for deployment
- MetaMask for wallet interaction

## Deployment
- **Contract Address (Sepolia Testnet):** `0xEb7DBCd2f17b9801DC39Cf91c588E0216D1F42D2`
- **Verification Links:**
  - [Sourcify](https://repo.sourcify.dev/11155111/0xEb7DBCd2f17b9801DC39Cf91c588E0216D1F42D2/)
  - [Blockscout](https://eth-sepolia.blockscout.com/address/0xEb7DBCd2f17b9801DC39Cf91c588E0216D1F42D2?tab=contract)
  - [Routescan](https://testnet.routescan.io/address/0xEb7DBCd2f17b9801DC39Cf91c588E0216D1F42D2/contract/11155111/code)

## How to Interact
1. **Mint Tokens**
   - Call `mint(amount)` from your wallet
   - `amount` is in whole tokens (scaled by 10^18 internally)

2. **Transfer Tokens**
   - Use standard ERC-20 `transfer(address recipient, uint256 amount)` function
   - Can be done via Remix or any Web3 interface

## Notes
- This contract uses OpenZeppelin's standard libraries for security and reliability.
- The mint function allows anyone to mint tokens to their own address.
- No frontend integration is included in this branch (Tier 4 handles integration).

## Optional
- Screenshots from Remix deployment and MetaMask transaction history can be added here.
