import { useState, useEffect } from "react";
import abi from "./abi.json";
import { ethers } from "ethers";
// import "./App.css";

function App() {
  const [amount, setAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const contractAddress = "0x99CF4c4CAE3bA61754Abd22A8de7e8c7ba3C196d";

  useEffect(() => {
    checkConnection();
    window.ethereum?.on("accountsChanged", handleAccountChange);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountChange);
    };
  }, []);

  const handleAccountChange = async (accounts) => {
    if (accounts.length > 0) {
      setConnectedAddress(accounts[0]);
      await updateBalances();
    } else {
      setConnectedAddress("");
      setIsConnected(false);
    }
  };

  async function checkConnection() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0]);
          setIsConnected(true);
          await updateBalances();
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  }

  async function requestAccounts() {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      setConnectedAddress(accounts[0]);
      setIsConnected(true);
      await updateBalances();
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
    }
  }

  async function updateBalances() {
    await Promise.all([getWalletBalance()]);
  }

  async function getWalletBalance() {
    if (typeof window.ethereum !== "undefined" && connectedAddress) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(connectedAddress);
        setWalletBalance(ethers.formatEther(balance));
      } catch (err) {
        console.error("Failed to get wallet balance:", err);
      }
    }
  }

  // async function getContractBalance() {
  //   if (typeof window.ethereum !== "undefined") {
  //     try {
  //       const provider = new ethers.BrowserProvider(window.ethereum);
  //       const contract = new ethers.Contract(contractAddress, abi, provider);
  //       const balance = await contract.getBalance();
  //       setContractBalance(ethers.formatEther(balance));
  //     } catch (err) {
  //       console.error("Failed to retrieve contract balance:", err);
  //     }
  //   }
  // }

  async function depositFunds() {
    setError("");
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract.deposit(ethers.parseEther(amount), {
          value: ethers.parseEther(amount)
        });
        await tx.wait();
        alert("Deposit successful");
        await updateBalances();
      } catch (err) {
        setError("Deposit failed. Please check your balance and try again.");
        console.error("Deposit failed:", err);
      }
    }
  }

  async function withdrawFunds() {
    setError("");
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract.withdraw(ethers.parseEther(amount));
        await tx.wait();
        alert("Withdrawal successful");
        await updateBalances();
      } catch (err) {
        setError("Withdrawal failed. Please check your balance and try again.");
        console.error("Withdrawal failed:", err);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <h1 className="text-3xl font-bold mb-8 text-center text-red-600"> <span className="text-green-500">KodeD</span>App</h1>
              
              {!isConnected ? (
                <button
                  onClick={requestAccounts}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Connected Address:</p>
                    <p className="font-mono break-all">{connectedAddress}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-gray-600">Amount (ETH):</p>
                    <input
                      type="number"
                      placeholder="input amount"
                      className="border rounded-md px-3 py-2"
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={depositFunds}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={withdrawFunds}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Withdraw
                    </button>
                  </div>

                  <div className="space-y-2 pt-4">
                    <p className="text-sm text-gray-600">
                      Wallet Balance: {walletBalance} ETH
                    </p>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;