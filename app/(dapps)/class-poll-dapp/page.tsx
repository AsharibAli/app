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
import { MetaMaskConnect } from "@/components/MetaMaskConnect";

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
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [contracts, setContracts] = useState<Contracts | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", ""]);
  const [voteCountsUpdated, setVoteCountsUpdated] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (authState.idToken) {
      const decodedToken = jwtDecode<DecodedToken>(authState.idToken);
      setOcidUsername(decodedToken.edu_username);
    }
  }, [authState.idToken]);

  const handleConnect = async (address: string) => {
    try {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setAccountAddress(address);
      setIsConnected(true);

      const contractAddress = "0xd6374c1A42464df6db7E4a34fc54Cb94FA1817E9";
      const ClassPoll = new web3Instance.eth.Contract(
        contractJson.abi,
        contractAddress
      ) as Contracts;
      ClassPoll.setProvider(window.ethereum);
      setContracts(ClassPoll);

      // Fetch current poll after connection
      await fetchCurrentPoll();
    } catch (error) {
      console.error("Failed to initialize web3 or contract:", error);
    }
  };

  const handleDisconnect = () => {
    setWeb3(undefined);
    setContracts(undefined);
    setAccountAddress(undefined);
    setIsConnected(false);
    setCurrentPoll(null);
    setVoteCountsUpdated(false);
  };

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
        setNewQuestion("");
        setNewOptions(["", "", ""]);
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

            <MetaMaskConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />

            {isConnected && (
              <div className="w-full space-y-6">
                <div className="space-y-4">
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
                    className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded w-full"
                    onClick={createPoll}
                  >
                    Create Poll
                  </Button>
                </div>

                {currentPoll && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{currentPoll.question}</h2>
                    {currentPoll.options.map((option, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <Button
                          className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded w-3/4"
                          onClick={() => vote(index)}
                        >
                          {option}
                        </Button>
                        <span className="text-xl font-bold">
                          Votes: {currentPoll.votes[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {showMessage && (
                  <>
                    <p className="text-center text-sm mt-6">Processing transaction...</p>
                    <p className="mt-2 text-xs">
                      Txn hash:{" "}
                      <a
                        className="text-teal-300"
                        href={
                          "https://educhain.blockscout.com/tx/" + txnHash
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {txnHash}
                      </a>
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ClassPoll;