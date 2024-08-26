"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractJson from "@/contracts/AnonymousFeedback.sol/AnonymousFeedback.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoginButton from "@/components/LoginButton";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import { Contracts } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

const FeedbackApp: React.FC = () => {
  const { authState } = useOCAuth();
  const [mmStatus, setMmStatus] = useState<string>("Not connected!");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [feedback, setFeedback] = useState<string>("");
  const [submittedFeedback, setSubmittedFeedback] = useState<string[]>([]);
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [getNetwork, setGetNetwork] = useState<number | undefined>(undefined);
  const [contracts, setContracts] = useState<Contracts | undefined>(undefined);
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
  const [isEducator, setIsEducator] = useState<boolean>(false);

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
      // Change this to the actual educator OCID username like "edu_"
      setIsEducator(decodedToken.edu_username.startsWith("asharib")); 
    }

    (async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
          const networkId: any = await web3.eth.getChainId();
          setGetNetwork(networkId);
          // Replace with your actual contract address
          const contractAddress = "0x5E953eF799f59D2589b72c19c05A7e02EAbcdf0C";
          setContractAddress(contractAddress);
          const AnonymousFeedback = new web3.eth.Contract(
            contractJson.abi,
            contractAddress
          ) as Contracts;
          setContracts(AnonymousFeedback);
          AnonymousFeedback.setProvider(window.ethereum);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Failed to initialize web3 or contract:", error);
      }
    })();
  }, [authState.idToken]);

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      alert("Feedback cannot be empty.");
      return;
    }
    setLoading(true);
    setShowMessage(true);
    if (contracts && accountAddress) {
      try {
        await contracts.methods
          .submitFeedback(feedback)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        setFeedback("");
        alert("Feedback submitted successfully!");
      } catch (error) {
        console.error("Failed to submit feedback:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const getFeedback = async () => {
    if (contracts) {
      try {
        const feedback = await contracts.methods.getAllFeedback().call();
        setSubmittedFeedback(feedback);
      } catch (error) {
        console.error("Failed to get feedback:", error);
      }
    }
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 Anonymous FB Dapp 📚
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
            <div className="flex flex-col items-center w-full">
              <Textarea
                placeholder="Enter your anonymous feedback about the course here"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full mb-4"
              />
              <Button
                className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                onClick={isConnected ? submitFeedback : undefined}
              >
                Submit Feedback
              </Button>
              {isEducator && (
                <Button
                  className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded mt-4"
                  onClick={isConnected ? getFeedback : undefined}
                >
                  View Feedback
                </Button>
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
            </div>
            {isEducator && submittedFeedback.length > 0 && (
              <div className="w-full mt-8">
                <h2 className="text-2xl font-bold mb-4">Submitted Feedback:</h2>
                {submittedFeedback.map((feedback, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-md mb-2">
                    {feedback}
                  </div>
                ))}
              </div>
            )}
                        {!isEducator && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Student View</AlertTitle>
                <AlertDescription>
                  As a student, you can submit anonymous feedbacks about the courses but cannot view all feedback submissions, only educators with ocid (edu_) can see it.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default FeedbackApp;