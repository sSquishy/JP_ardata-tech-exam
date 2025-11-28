import { useState } from "react";
import "./App.css";
import { connectWallet as connectWalletHelper, getBalance, getTransactions } from "./blockchain";
import type { SimpleTx } from "./blockchain";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<SimpleTx[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const address = await connectWalletHelper();
      setWalletAddress(address);

      const userBalance = await getBalance(address);
      setBalance(userBalance);

      const gas = await window.ethereum?.request({ method: "eth_gasPrice" });
      if (gas) setGasPrice((parseInt(gas as string, 16) / 1e9).toFixed(2));

      const block = await window.ethereum?.request({ method: "eth_blockNumber" });
      if (block) setBlockNumber(parseInt(block as string, 16).toString());

      await refreshTransactions(address);
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("An unknown error occurred");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setError(null);
    setBalance(null);
    setTransactions([]);
  };

  const refreshTransactions = async (address?: string) => {
    if (!address && !walletAddress) return;
    const addr = address || walletAddress!;
    setIsLoadingData(true);
    try {
      const txs = await getTransactions(addr);
      setTransactions(txs);
    } catch (error: unknown) {
      if (error instanceof Error) setError(error.message);
      else setError("Failed to fetch transactions");
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div className="login-container">
      <div className="content-wrapper">
        {/* Wallet Card */}
        <div className="login-card">
          <div className="login-header">
            <h1>Web3 Smart Contract</h1>
            <p className="subtitle">Connect your Ethereum wallet</p>
          </div>

          <div className="login-content">
            {walletAddress ? (
              <div className="wallet-connected">
                <h2>Wallet Connected</h2>
                <p>{walletAddress}</p>
                <button onClick={disconnectWallet}>Disconnect Wallet</button>
              </div>
            ) : (
              <button onClick={connectWallet}>{isConnecting ? "Connecting..." : "Connect Wallet"}</button>
            )}

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* Dashboard */}
        {walletAddress && (
          <div className="dashboard-card">
            <h2>Dashboard</h2>

            <div className="info-section">
              <div>Gas Price: {gasPrice ? `${gasPrice} Gwei` : "Loading..."}</div>
              <div>Current Block: {blockNumber ?? "Loading..."}</div>
            </div>

            <div>ETH Balance: {balance ? `${balance} ETH` : "Loading..."}</div>

            <div className="transactions-section">
              <h3>Recent Transactions</h3>
              <button onClick={() => refreshTransactions()}>Refresh Transactions</button>

              {isLoadingData ? (
                <div>🔄 Loading transactions...</div>
              ) : transactions.length > 0 ? (
                <div className="transactions-list">
                  {transactions.map((tx) => (
                    <div key={tx.hash}>
                      <div>Hash: {tx.hash}</div>
                      <div>From: {tx.from}</div>
                      <div>To: {tx.to || "Contract Creation"}</div>
                      <div>Value: {parseFloat(tx.value).toFixed(6)} ETH</div>
                      <div>Block: {tx.blockNumber}</div>
                      <hr />
                    </div>
                  ))}
                </div>
              ) : (
                <div>No transactions found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
