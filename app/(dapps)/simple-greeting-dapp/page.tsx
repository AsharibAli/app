"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractJson from "@/contracts/Greeter.sol/Greeter.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const App: React.FC = () => {
  const { authState } = useOCAuth();
  const [displayMessage, setDisplayMessage] = useState<string>("");
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [contracts, setContracts] = useState<Contracts | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
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

      const contractAddress = "0x48D2d71e26931a68A496F66d83Ca2f209eA9956E";
      const Greeter = new web3Instance.eth.Contract(
        contractJson.abi,
        contractAddress
      ) as Contracts;
      Greeter.setProvider(window.ethereum);
      setContracts(Greeter);
    } catch (error) {
      console.error("Failed to initialize web3 or contract:", error);
    }
  };

  const handleDisconnect = () => {
    setWeb3(undefined);
    setContracts(undefined);
    setAccountAddress(undefined);
    setIsConnected(false);
  };

  const receive = async () => {
    if (contracts) {
      try {
        const displayMessage = await contracts.methods.read().call();
        setDisplayMessage(displayMessage);
      } catch (error) {
        console.error("Failed to read from contract:", error);
      }
    }
  };

  const send = async () => {
    const getMessage = (document.getElementById("message") as HTMLInputElement)
      .value;
    if (!getMessage.trim()) {
      alert("Message cannot be empty.");
      return;
    }
    setLoading(true);
    setShowMessage(true);
    if (contracts && accountAddress) {
      try {
        await contracts.methods
          .write(getMessage)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        await receive();
      } catch (error) {
        console.error("Failed to write to contract:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 Simple Greetings Dapp 📚
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
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Enter a message to put onchain"
                  id="message"
                  className="w-80 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
                />
                <div className="flex space-x-4">
                  <Button
                    className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                    onClick={send}
                  >
                    Send
                  </Button>
                  <Button
                    className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                    onClick={receive}
                  >
                    Receive
                  </Button>
                </div>
                {showMessage && (
                  <>
                    <p className="text-center text-sm mt-6"> loading...</p>
                    <p className="mt-4 text-xs ">
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
                    <p className="mt-2 text-xs">
                      Please wait till the Txn is completed :)
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

export default App;