"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractJson from "@/contracts/StudyTracker.sol/StudyTracker.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/LoginButton";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import { Contracts } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock } from "lucide-react";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

const StudyTracker: React.FC = () => {
  const { authState } = useOCAuth();
  const [mmStatus, setMmStatus] = useState<string>("Not connected!");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [getNetwork, setGetNetwork] = useState<number | undefined>(undefined);
  const [contracts, setContracts] = useState<Contracts | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
  const [isStudying, setIsStudying] = useState<boolean>(false);
  const [studyTime, setStudyTime] = useState<number>(0);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const switchToOpenCampusNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Try to switch to the Open Campus Codex network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa045c" }], // 656476 in hexadecimal
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xa045c",
                  chainName: "Open Campus Codex",
                  nativeCurrency: {
                    name: "EDU",
                    symbol: "EDU",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                  blockExplorerUrls: ["https://opencampus-codex.blockscout.com/"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Open Campus Codex network:", addError);
          }
        } else {
          console.error("Failed to switch to Open Campus Codex network:", switchError);
        }
      }
    }
  };

  const ConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // First, ensure we're on the correct network
        await switchToOpenCampusNetwork();

        // Now check if we're on the correct network
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        
        if (chainId !== "0xa045c") {
          alert("Please connect to the Open Campus Codex network in MetaMask.");
          return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setAccountAddress(accounts[0]);
        setMmStatus("Connected!");
        setIsConnected(true);
        localStorage.setItem('walletAddress', accounts[0]);
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    // Check local storage for wallet connection
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setAccountAddress(storedAddress);
      setIsConnected(true);
      setMmStatus("Connected!");
    }

    // Check if user is logged in with OCID
    if (authState.idToken) {
      const decodedToken = jwtDecode<DecodedToken>(authState.idToken);
      setOcidUsername(decodedToken.edu_username);
      localStorage.setItem('ocidUsername', decodedToken.edu_username);
    } else {
      // Check local storage for OCID username
      const storedUsername = localStorage.getItem('ocidUsername');
      if (storedUsername) {
        setOcidUsername(storedUsername);
      }
    }

    // Initialize Web3 and set contract
    (async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
          const networkId: any = await web3.eth.getChainId();
          setGetNetwork(networkId);
          const contractAddress = "0x4592d03bf91Ba5667F2C064A3CC122917EC41f1F"; // Replace with your actual contract address
          setContractAddress(contractAddress);
          const StudyTracker = new web3.eth.Contract(
            contractJson.abi,
            contractAddress
          ) as Contracts;
          setContracts(StudyTracker);
          StudyTracker.setProvider(window.ethereum);

          // Check if already connected
          if (storedAddress) {
            const accounts = await web3.eth.getAccounts();
            if (accounts[0] === storedAddress) {
              setAccountAddress(accounts[0]);
              setIsConnected(true);
              setMmStatus("Connected!");
            } else {
              // Clear stored address if it doesn't match current account
              localStorage.removeItem('walletAddress');
              setIsConnected(false);
              setMmStatus("Not connected!");
            }
          }
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Failed to initialize web3 or contract:", error);
      }
    })();

    // Add event listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [authState.idToken]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setIsConnected(false);
      setAccountAddress(undefined);
      setMmStatus("Not connected!");
      localStorage.removeItem('walletAddress');
    } else if (accounts[0] !== accountAddress) {
      // User switched to a different account
      setAccountAddress(accounts[0]);
      setIsConnected(true);
      setMmStatus("Connected!");
      localStorage.setItem('walletAddress', accounts[0]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const toggleStudyTimer = async () => {
    if (!isStudying) {
      setStartTime(Date.now());
      setIsStudying(true);
    } else {
      setIsStudying(false);
      if (startTime) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        await recordStudySession(duration);
      }
    }
  };

  const recordStudySession = async (duration: number) => {
    setLoading(true);
    setShowMessage(true);
    if (contracts && accountAddress) {
      try {
        await contracts.methods
          .recordStudySession(duration)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        await getTotalStudyTime();
      } catch (error) {
        console.error("Failed to record study session:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const getTotalStudyTime = async () => {
    if (contracts && accountAddress) {
      try {
        const totalTime = await contracts.methods.getTotalStudyTime().call({ from: accountAddress });
        setTotalStudyTime(parseInt(totalTime));
      } catch (error) {
        console.error("Failed to get total study time:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 Study Time Tracker Dapp 📚
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center mt-4 space-y-6">
            {!ocidUsername && <LoginButton />}
            {ocidUsername && (
              <div className="text-center text-xl">
                <h1>
                  👉Welcome,{" "}
                  <a href="/user">
                    <strong>{ocidUsername}👈</strong>
                  </a>{" "}
                </h1>
              </div>
            )}
            {isConnected && (
              <div className="text-center text-xl">
                <h1>
                  Connected to wallet address: <strong>{accountAddress}</strong>
                </h1>
              </div>
            )}
            {!isConnected && (
              <Button
                className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
                onClick={ConnectWallet}
                variant="link"
              >
                Connect with MetaMask
              </Button>
            )}
            {isConnected && (
              <div className="flex flex-col items-center space-y-4">
                <div className="text-6xl font-bold">
                  {formatTime(studyTime)}
                </div>
                <Button
                  className={`${
                    isStudying ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
                  } text-white font-bold py-2 px-4 rounded-full`}
                  onClick={toggleStudyTimer}
                >
                  {isStudying ? "Stop Studying" : "Start Studying"}
                </Button>
                <div className="text-xl">
                  Total Study Time: {formatTime(totalStudyTime)}
                </div>
                <Button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={getTotalStudyTime}
                >
                  Refresh Total Time
                </Button>
              </div>
            )}
            {showMessage && (
              <>
                <p className="text-center text-sm mt-6"> Recording study session...</p>
                <p className="mt-4 text-xs ">
                  Txn hash:{" "}
                  <a
                    className="text-teal-300"
                    href={
                      "https://opencampus-codex.blockscout.com/tx/" + txnHash
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {txnHash}
                  </a>
                </p>
                <p className="mt-2 text-xs">
                  Please wait till the Txn is completed :)
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default StudyTracker;