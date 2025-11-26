// src/blockchain.ts
import { ethers } from 'ethers'

/**
 * NOTE:
 * - Do NOT hardcode your Etherscan API key into repo.
 * - Use an env var (e.g. VITE_ETHERSCAN_API_KEY) and access via import.meta.env in Vite.
 */

/** Connect to MetaMask and return the selected address */
export async function connectWallet(): Promise<string> {
  if (!(window as any).ethereum) throw new Error('MetaMask is not installed')
  const provider = new ethers.BrowserProvider((window as any).ethereum) // ethers v6
  // Request account access
  const accounts = (await provider.send('eth_requestAccounts', [])) as string[]
  if (!accounts || accounts.length === 0) throw new Error('No accounts found')
  return accounts[0]
}

/** Get ETH balance (returns string in ETH, 4 decimal places) */
export async function getBalance(address: string): Promise<string> {
  if (!(window as any).ethereum) throw new Error('No provider available')
  const provider = new ethers.BrowserProvider((window as any).ethereum)
  const bal = await provider.getBalance(address)
  // formatEther returns string; limit decimals
  const eth = ethers.formatEther(bal)
  const parsed = parseFloat(eth)
  return parsed.toFixed(4)
}

/** Fetch last 10 transactions via Etherscan (returns normalized tx objects) */
export type SimpleTx = {
  hash: string
  from: string
  to: string | null
  value: string // in ETH
  blockNumber: string
}

export async function getTransactions(address: string): Promise<SimpleTx[]> {
  // read Etherscan key from Vite env; set VITE_ETHERSCAN_API_KEY in .env
  const apiKey = (import.meta as any).env?.VITE_ETHERSCAN_API_KEY
  if (!apiKey) throw new Error('Etherscan API key not configured (VITE_ETHERSCAN_API_KEY)')

  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch transactions from Etherscan')
  const data = await res.json()
  if (!data.result || !Array.isArray(data.result)) return []

  const limited = data.result.slice(0, 10).map((tx: any) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to || null,
    value: ethers.formatEther(tx.value ?? '0'), // returns string
    blockNumber: tx.blockNumber,
  }))

  return limited
}
