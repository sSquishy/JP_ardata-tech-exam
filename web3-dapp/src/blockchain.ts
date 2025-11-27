import { ethers } from 'ethers'

/** Connect to MetaMask and return the selected address */
export async function connectWallet(): Promise<string> {
  if (!(window as any).ethereum) throw new Error('MetaMask is not installed')
  const provider = new ethers.BrowserProvider((window as any).ethereum) // ethers v6
  const accounts = (await provider.send('eth_requestAccounts', [])) as string[]
  if (!accounts || accounts.length === 0) throw new Error('No accounts found')
  return accounts[0]
}

/** Get ETH balance (returns string in ETH, 4 decimal places) */
export async function getBalance(address: string): Promise<string> {
  if (!(window as any).ethereum) throw new Error('No provider available')
  const provider = new ethers.BrowserProvider((window as any).ethereum)
  const bal = await provider.getBalance(address)
  const eth = ethers.formatEther(bal)
  return parseFloat(eth).toFixed(4)
}

/** Transaction type */
export type SimpleTx = {
  hash: string
  from: string
  to: string | null
  value: string // in ETH
  blockNumber: string
}

/** Fetch last 10 transactions via Etherscan (supports mainnet and testnets) */
export async function getTransactions(address: string): Promise<SimpleTx[]> {
  const apiKey = (import.meta as any).env?.VITE_ETHERSCAN_API_KEY
  if (!apiKey) throw new Error('Etherscan API key not configured (VITE_ETHERSCAN_API_KEY)')

  // Detect network via MetaMask
  const chainIdHex = await window.ethereum?.request({ method: 'eth_chainId' })
  const chainId = chainIdHex ? parseInt(chainIdHex as string, 16) : 1

  let baseUrl = 'https://api.etherscan.io/api' // default mainnet
  if (chainId === 5) baseUrl = 'https://api-goerli.etherscan.io/api' // Goerli
  if (chainId === 11155111) baseUrl = 'https://api-sepolia.etherscan.io/api' // Sepolia

  const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch transactions from Etherscan')

  const data = await res.json()
  console.log('Etherscan response:', data) // Debugging

  if (!data.result || !Array.isArray(data.result)) return []

  return data.result.slice(0, 10).map((tx: any) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to || null,
    value: ethers.formatEther(tx.value ?? '0'),
    blockNumber: tx.blockNumber,
  }))
}
