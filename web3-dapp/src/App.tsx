import { useState } from 'react'
import './App.css'
import {
  connectWallet as connectWalletHelper,
  getBalance,
  getTransactions
} from './blockchain.ts'

interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  blockNumber: string
  timestamp?: number
}

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);

  // -----------------------
  // Connect wallet handler
  // -----------------------
  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const address = await connectWalletHelper()
      setWalletAddress(address)

      // Get balance
      const userBalance = await getBalance(address)
      setBalance(userBalance)

      // Fetch Gas Price
      const gas = await window.ethereum?.request({ method: 'eth_gasPrice' })
      if (gas) setGasPrice((parseInt(gas as string, 16) / 1e9).toFixed(2)) // Gwei

      // Fetch Current Block Number
      const block = await window.ethereum?.request({ method: 'eth_blockNumber' })
      if (block) setBlockNumber(parseInt(block as string, 16).toString())

      // Fetch transaction history
      setIsLoadingData(true)
      const txs = await getTransactions(address, 'https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=YOURKEY') // just the API key
      setTransactions(txs)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
      setIsLoadingData(false)
    }
  }


  const disconnectWallet = () => {
    setWalletAddress(null)
    setError(null)
    setBalance(null)
    setTransactions([])
  }

  return (
    <div className="login-container">
      <div className="content-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1>Web3 Smart Contract</h1>
            <p className="subtitle">Connect your Ethereum wallet</p>
          </div>

          <div className="login-content">
            {walletAddress ? (
              <div className="wallet-connected">
                <div className="success-icon">✓</div>
                <h2>Wallet Connected</h2>

                <div className="wallet-address">
                  <p className="address-label">Connected Address:</p>
                  <p className="address-value">{walletAddress}</p>
                </div>

                <button
                  className="btn btn-disconnect"
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div className="wallet-disconnected">
                <div className="wallet-icon">🔐</div>
                <p className="instruction-text">
                  Click the button below to connect your Ethereum wallet and
                  access the smart contract.
                </p>

                <button
                  className="btn btn-connect"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}
          </div>

          <div className="login-footer">
            <p>Using MetaMask for secure authentication</p>
          </div>
        </div>

        {/* DASHBOARD */}
        {walletAddress && (
          <div className="dashboard-card">
            <div className="dashboard-header">
              <h2>Dashboard</h2>
            </div>

            <div className="dashboard-content">

              {/* Gas & Block Info */}
              <div className="info-section">
                <div className="info-card">
                  <p className="info-label">Current Gas Price</p>
                  <p className="info-value">{gasPrice ? `${gasPrice} Gwei` : 'Loading...'}</p>
                </div>

                <div className="info-card">
                  <p className="info-label">Current Block</p>
                  <p className="info-value">{blockNumber ?? 'Loading...'}</p>
                </div>
              </div>

              <div className="balance-section">
                <div className="balance-label">ETH Balance</div>
                <div className="balance-value">
                  {balance ? `${balance} ETH` : 'Loading...'}
                </div>
              </div>

              <div className="transactions-section">
                <h3>Recent Transactions</h3>

                {isLoadingData ? (
                  <div className="loading-message">
                    Loading transactions...
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="transactions-list">
                    {transactions.map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="tx-hash">
                          <span className="tx-label">Hash:</span>
                          <span className="tx-value" title={tx.hash}>
                            {tx.hash.substring(0, 10)}...
                            {tx.hash.substring(tx.hash.length - 8)}
                          </span>
                        </div>

                        <div className="tx-details">
                          <span className="tx-label">From:</span>
                          <span className="tx-value" title={tx.from}>
                            {tx.from.substring(0, 8)}...
                          </span>
                        </div>

                        <div className="tx-details">
                          <span className="tx-label">To:</span>
                          <span className="tx-value" title={tx.to || 'N/A'}>
                            {tx.to
                              ? `${tx.to.substring(0, 8)}...`
                              : 'Contract Creation'}
                          </span>
                        </div>

                        <div className="tx-value-amount">
                          <span className="tx-label">Value:</span>
                          <span className="tx-amount">{tx.value} ETH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-transactions">
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}
