import { useState, useEffect } from "react";
import { ethers } from "ethers";
import bank_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState(undefined);
  const [balance, setBalance] = useState("0");
  const [showAddress, setShowAddress] = useState(true);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 
  const bankABI = bank_abi.abi;

  const getWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setEthWallet(provider);
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            console.log("No accounts found. Please connect MetaMask.");
            setErrorMessage("No accounts found. Please connect MetaMask.");
            setShowError(true);
          }
        });
      } else {
        console.log("MetaMask not found. Please install MetaMask.");
        throw new Error("MetaMask not found. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error connecting to Ethereum provider:", error);
      setErrorMessage("Error connecting to Ethereum provider. Please check if MetaMask is installed and unlocked.");
      setShowError(true);
    }
  };  

  const connectAccount = async () => {
    try {
      if (!ethWallet) {
        throw new Error("Ethereum provider not initialized.");
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      
      // Wait for the account to be set before initializing the bank contract
      await getBankContract();
  
    } catch (error) {
      console.error("Error connecting to account:", error);
      setErrorMessage(error.message);
      setShowError(true);
    }
  };
  
  const getBankContract = async () => {
    try {
      if (!ethWallet) {
        throw new Error("Ethereum provider not initialized.");
      }
  
      const signer = ethWallet.getSigner();
      const bankContract = new ethers.Contract(contractAddress, bankABI, signer);
      setBank(bankContract);
      
      // Fetch balance only after setting the bank contract
      await getBalance(account); // Assuming account is already set
  
    } catch (error) {
      console.error("Error initializing bank contract:", error);
      setErrorMessage(error.message);
      setShowError(true);
    }
  };    

  const getBalance = async (address) => {
    try {
      if (bank) {
        const balance = await bank.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
      } else {
        throw new Error("Bank contract not initialized.");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };  

  const deposit = async () => {
    try {
      if (!bank) {
        throw new Error("Bank contract not initialized.");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      const depositAmount = ethers.utils.parseEther(amount);
      const tx = await bank.deposit({ value: depositAmount });
      await tx.wait();
      getBalance(account); // Refresh balance after deposit
      setAmount("");
      setShowError(false);
    } catch (error) {
      console.error("Error depositing:", error);
      setErrorMessage(error.message);
      setShowError(true);
    }
  };

  const withdraw = async () => {
    try {
      if (!bank) {
        throw new Error("Bank contract not initialized.");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      const withdrawAmount = ethers.utils.parseEther(amount);
      const tx = await bank.withdraw(withdrawAmount);
      await tx.wait();
      getBalance(account); // Refresh balance after withdrawal
      setAmount("");
      setShowError(false);
    } catch (error) {
      console.error("Error withdrawing:", error);
      setErrorMessage(error.message);
      setShowError(true);
    }
  };

  const transferToken = async () => {
    try {
      if (!bank) {
        throw new Error("Bank contract not initialized.");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount.");
      }
      if (!recipient || !ethers.utils.isAddress(recipient)) {
        throw new Error("Please enter a valid recipient address.");
      }
      const transferAmount = ethers.utils.parseEther(amount);
      const tx = await bank.transferToken(recipient, transferAmount);
      await tx.wait();
      getBalance(account); // Refresh balance after transferring tokens
      setAmount("");
      setRecipient("");
      setShowError(false);
    } catch (error) {
      console.error("Error transferring tokens:", error);
      setErrorMessage(error.message);
      setShowError(true);
    }
  };

  const toggleAddressVisibility = () => {
    setShowAddress(!showAddress);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>MetaCrafter Wallet</h1>
        <h6>By: Carl Adrales</h6>
      </header>
      <div className="content">
        {ethWallet && account ? (
          <div className="wallet-container">
            <button onClick={toggleAddressVisibility}>Show/Hide Address</button>
            {showAddress && <p>Owner Address: {account}</p>}
            <div className="buttons-container">
              <input type="number" value={amount} onChange={handleAmountChange} placeholder="Enter amount in Token" min="0" step="1" />
              <button onClick={deposit}>Deposit</button>
              <button onClick={withdraw}>Withdraw</button>
              <input type="text" value={recipient} onChange={handleRecipientChange} placeholder="Enter recipient address" />
              <button onClick={transferToken}>Transfer Token</button>
            </div>
            {showError && <div className="error-message">{errorMessage}</div>}
          </div>
        ) : (
          <div className="connect-wallet-container">
            <button onClick={connectAccount}>Connect Wallet</button>
            {showError && <div className="error-message">{errorMessage}</div>}
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 50vh;
          padding: 20px;
          background-color: #141d26;
          color: #ffffff;
          font-family: Century Gothic, sans-serif;
        }
        header {
          margin-bottom: 20px;
        }
        h1 {
          color: #007bff;
          margin-bottom: 0;
        }
        .content {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .wallet-container {
          border: 1px solid #ccc;
          padding: 20px;
          border-radius: 10px;
          background-color: #1e2a38;
          color: #ffffff;
          text-align: center;
          width: 400px;
          position: relative;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .connect-wallet-container {
          margin-top: 20px;
        }
        .buttons-container {
          margin-top: 20px;
        }
        .buttons-container button {
          margin: 5px;
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          background-color: #007bff;
          color: #ffffff;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .buttons-container button:hover {
          background-color: #0056b3;
        }
        .buttons-container input {
          margin: 5px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          width: calc(100% - 22px);
        }
        .error-message {
          color: red;
          position: absolute;
          top: -30px;
          left: 0;
          right: 0;
          margin: 0 auto;
          background-color: #fff0f0;
          border: 1px solid #ffcccc;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </main>
  );
}
