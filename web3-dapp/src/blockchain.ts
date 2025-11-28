// blockchain.ts
import { ethers } from 'ethers';

// Add proper window.ethereum type declaration
declare global {
  interface Window {
    ethereum?: any;
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
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Please connect your MetaMask wallet to continue.');
    }
    throw new Error(error.message || 'Failed to connect wallet');
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

/** Fetch last 10 transactions via Etherscan API (manual fetch) with fallback to mock data */
export async function getTransactions(address: string): Promise<SimpleTx[]> {
  try {
    const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

    if (!apiKey) {
      console.warn('Etherscan API key not found. Using mock data for demonstration.');
      return getMockTransactions(address);
    }
    
    const chainIdHex = await window.ethereum?.request({ method: 'eth_chainId' });
    const chainId = chainIdHex ? parseInt(chainIdHex as string, 16) : 1;

    let baseUrl = 'api.etherscan.io';
    if (chainId === 11155111) {
      baseUrl = 'api-sepolia.etherscan.io';
    } else if (chainId === 5) {
      baseUrl = 'api-goerli.etherscan.io';
    }
    
    const url = `${baseUrl}?module=account&action=txlist&address=${address}&page=1&offset=10&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === '0') {
      if (data.message === 'No transactions found') {
        return [];
      }
      throw new Error(`Etherscan API error: ${data.message}`);
    }

    if (!Array.isArray(data.result)) {
      throw new Error('Unexpected API response format');
    }

    return data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value || '0'),
      blockNumber: tx.blockNumber,
    }));
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    return getMockTransactions(address);
  }
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
