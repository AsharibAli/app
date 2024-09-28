"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractJson from "@/contracts/ClassPoll.sol/ClassPoll.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginButton from "@/components/LoginButton";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import { Contracts } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

interface Poll {
  question: string;
  options: string[];
  votes: number[];
}

const ClassPoll: React.FC = () => {
  const { authState } = useOCAuth();
  const [mmStatus, setMmStatus] = useState<string>("Not connected!");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [contracts, setContracts] = useState<Contracts | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", ""]);
  const [voteCountsUpdated, setVoteCountsUpdated] = useState<boolean>(false);

  const switchToOpenCampusNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa045c" }],
        });
      } catch (switchError: any) {
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
        await switchToOpenCampusNetwork();
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0xa045c") {
          alert("Please connect to the Open Campus Codex network in MetaMask.");
          return;
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        setAccountAddress(accounts[0]);
        setMmStatus("Connected!");
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    if (authState.idToken) {
      const decodedToken = jwtDecode<DecodedToken>(authState.idToken);
      setOcidUsername(decodedToken.edu_username);
    }

    (async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
          const contractAddress = "0x82D4bF11eA7d4295F94f9f6Ae4Bd04B91CCE11AA";
          setContractAddress(contractAddress);
          const ClassPoll = new web3.eth.Contract(
            contractJson.abi,
            contractAddress
          ) as Contracts;
          setContracts(ClassPoll);
          ClassPoll.setProvider(window.ethereum);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Failed to initialize web3 or contract:", error);
      }
    })();
  }, [authState.idToken]);

  const createPoll = async () => {
    if (!newQuestion.trim() || newOptions.some(option => !option.trim())) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setShowMessage(true);
    if (contracts && accountAddress) {
      try {
        await contracts.methods
          .createPoll(newQuestion, newOptions)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        await fetchCurrentPoll();
      } catch (error) {
        console.error("Failed to create poll:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const fetchVoteCounts = async () => {
    if (contracts) {
      try {
        const voteCounts = await contracts.methods.getVoteCounts().call();
        setCurrentPoll(prevPoll => {
          if (prevPoll) {
            return { ...prevPoll, votes: voteCounts.map(Number) };
          }
          return null;
        });
        setVoteCountsUpdated(prev => !prev);
      } catch (error) {
        console.error("Failed to fetch vote counts:", error);
      }
    }
  };

  const vote = async (optionIndex: number) => {
    setLoading(true);
    setShowMessage(true);
    if (contracts && accountAddress) {
      try {
        await contracts.methods
          .vote(optionIndex)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        await fetchVoteCounts();
      } catch (error) {
        console.error("Failed to vote:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const fetchCurrentPoll = async () => {
    if (contracts) {
      try {
        const poll = await contracts.methods.getCurrentPoll().call();
        setCurrentPoll({
          ...poll,
          votes: poll.votes.map(Number)
        });
        await fetchVoteCounts();
      } catch (error) {
        console.error("Failed to fetch current poll:", error);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchCurrentPoll();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && currentPoll) {
      const interval = setInterval(fetchVoteCounts, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected, currentPoll]);

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 Classroom Poll Dapp 📚
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
              <div className="w-full space-y-4">
                <Input
                  type="text"
                  placeholder="Enter poll question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full"
                />
                {newOptions.map((option, index) => (
                  <Input
                    key={index}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...newOptions];
                      updatedOptions[index] = e.target.value;
                      setNewOptions(updatedOptions);
                    }}
                    className="w-full"
                  />
                ))}
                <Button
                  className="w-full bg-teal-300 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded"
                  onClick={createPoll}
                >
                  Create Poll
                </Button>
              </div>
            )}
            {currentPoll && (
              <div className="w-full space-y-4">
                <h2 className="text-2xl font-bold">{currentPoll.question}</h2>
                {currentPoll.options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{option}</span>
                    <div className="space-x-2">
                      <span>{currentPoll.votes[index]} votes</span>
                      <Button
                        className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-4 rounded"
                        onClick={() => vote(index)}
                      >
                        Vote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showMessage && (
              <>
                <p className="text-center text-sm mt-6"> loading...</p>
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

export default ClassPoll;