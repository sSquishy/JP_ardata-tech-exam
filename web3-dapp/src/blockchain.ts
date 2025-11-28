import { ethers } from 'ethers';

const ALCHEMY_KEY = "PzVM39rbazQkvROnR6Atj"; // replace with your Sepolia key

// Add proper window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

/** Connect to MetaMask and return the selected address */
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask is not installed');

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);

    if (!accounts || accounts.length === 0) throw new Error('No accounts found');
    return accounts[0];
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to connect wallet');
    }
  }
}

/** Get ETH balance (returns string in ETH, 4 decimal places) */
export async function getBalance(address: string): Promise<string> {
  if (!window.ethereum) throw new Error('No provider available');

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    const eth = ethers.formatEther(balance);
    return parseFloat(eth).toFixed(4);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch balance');
  }
}

/** Transaction type */
export type SimpleTx = {
  hash: string;
  from: string;
  to: string | null;
  value: string; // in ETH
  blockNumber: string;
};

/** Fetch last 10 transactions from Alchemy Sepolia */
export async function getTransactions(address: string): Promise<SimpleTx[]> {
  const url = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
  const data = {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromAddress: address,
        category: ["external", "internal", "erc20", "erc721"],
        maxCount: "0xA", // last 10 transactions
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();

    if (!json.result || !json.result.transfers) return [];

    return json.result.transfers.map((tx: any): SimpleTx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to || null,
      value: (tx.value ? Number(tx.value) / 1e18 : 0).toString(),
      blockNumber: parseInt(tx.blockNum, 16).toString(),
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}