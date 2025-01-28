import { useState } from "react";
import abi from "./abi.json";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [balance, setBalance] = useState("");
  const contractAddress = "0x99CF4c4CAE3bA61754Abd22A8de7e8c7ba3C196d";

  async function requestAccounts() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function depositFunds() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccounts();
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract.deposit({
          value: ethers.parseEther(depositAmount),
        });
        await tx.wait();
        console.log("Deposit successful");
      } catch (error) {
        console.error("Deposit failed:", error);
      }
    } else {
      console.error("Ethereum wallet is not detected");
    }
  }

  async function withdrawFunds() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccounts();
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
        await tx.wait();
        console.log("Withdrawal successful");
      } catch (error) {
        console.error("Withdrawal failed:", error);
      }
    } else {
      console.error("Ethereum wallet is not detected");
    }
  }

  async function getContractBalance() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const balance = await contract.getBalance();
        setBalance(ethers.formatEther(balance));
        console.log("Balance retrieved:", ethers.formatEther(balance));
      } catch (error) {
        console.error("Failed to retrieve balance:", error);
      }
    } else {
      console.error("Ethereum wallet is not detected");
    }
  }

  return (
    <>
      <div>
        <h1>Smart Contract Interaction</h1>
        <div>
          <input
            type="text"
            placeholder="Enter deposit amount (ETH)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={depositFunds}>Deposit</button>
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter withdrawal amount (ETH)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdrawFunds}>Withdraw</button>
        </div>

        <div>
          <button onClick={getContractBalance}>Get Balance</button>
          <p>Contract Balance: {balance} ETH</p>
        </div>
      </div>
    </>
  );
}

export default App;
