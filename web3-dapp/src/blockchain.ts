import { ethers } from 'ethers';

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

/** Fetch last 10 transactions (mock data for Tier 1) */
export async function getTransactions(address: string): Promise<SimpleTx[]> {
  // For Tier 1, return mock data
  return getMockTransactions(address);
}

/** Fallback mock data for testing */
function getMockTransactions(address: string): SimpleTx[] {
  console.log('🔄 Using mock transactions data');
  return [
    {
      hash: `0x1a2b3c4d5e6f...${Date.now().toString(16)}`,
      from: address,
      to: '0x742d...44e',
      value: '0.0015',
      blockNumber: '18945678',
    },
    {
      hash: `0x2b3c4d5e6f...${(Date.now() + 1).toString(16)}`,
      from: '0x742d...44e',
      to: address,
      value: '0.0250',
      blockNumber: '18945672',
    },
    {
      hash: `0x3c4d5e6f...${(Date.now() + 2).toString(16)}`,
      from: address,
      to: null,
      value: '0.0000',
      blockNumber: '18945665',
    },
  ];
}
