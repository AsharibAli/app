"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractJson from "@/contracts/AssignmentSubmission.sol/AssignmentSubmission.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginButton from "@/components/LoginButton";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

interface Submission {
  student: string;
  assignmentHash: string;
  timestamp: number;
  verified: boolean;
}

export default function Component() {
  const { authState } = useOCAuth();
  const [mmStatus, setMmStatus] = useState<string>("Not connected!");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [contract, setContract] = useState<any>(undefined);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
  const [assignmentHash, setAssignmentHash] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
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

  const connectWallet = async () => {
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
          const contractAddress = "0x0EA845BCC2bafD0C54cD0CFfCEF23B57aac439ED"; // Replace with your deployed contract address
          const AssignmentSubmission = new web3.eth.Contract(
            contractJson.abi,
            contractAddress
          );
          setContract(AssignmentSubmission);
          AssignmentSubmission.setProvider(window.ethereum);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Failed to initialize web3 or contract:", error);
      }
    })();
  }, [authState.idToken]);

  const submitAssignment = async () => {
    if (!assignmentHash.trim()) {
      alert("Assignment hash cannot be empty.");
      return;
    }
    setLoading(true);
    setShowMessage(true);
    if (contract && accountAddress) {
      try {
        await contract.methods
          .submitAssignment(assignmentHash)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        await fetchSubmissions();
        setAssignmentHash("");
      } catch (error) {
        console.error("Failed to submit assignment:", error);
      }
    }
    setLoading(false);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const fetchSubmissions = async () => {
    if (contract && isEducator) {
      try {
        const count = await contract.methods.getSubmissionsCount().call();
        const fetchedSubmissions = [];
        for (let i = 0; i < count; i++) {
          const submission = await contract.methods.getSubmission(i).call();
          fetchedSubmissions.push({
            student: submission[0],
            assignmentHash: submission[1],
            timestamp: parseInt(submission[2]),
            verified: submission[3],
          });
        }
        setSubmissions(fetchedSubmissions);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      }
    }
  };

  const verifySubmission = async (index: number) => {
    if (contract && accountAddress && isEducator) {
      try {
        await contract.methods
          .verifySubmission(index)
          .send({ from: accountAddress })
          .on("transactionHash", (hash: string) => {
            setTxnHash(hash);
          });
        await fetchSubmissions();
      } catch (error) {
        console.error("Failed to verify submission:", error);
      }
    }
  };

  useEffect(() => {
    if (contract && isEducator) {
      fetchSubmissions();
    }
  }, [contract, isEducator]);

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 Assignment Submit Dapp 📚
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
                onClick={connectWallet}
                variant="link"
              >
                Connect with MetaMask
              </Button>
            )}
            <div className="flex flex-col items-center w-full">
              <Input
                type="text"
                placeholder="Enter assignment hash or URL"
                value={assignmentHash}
                onChange={(e) => setAssignmentHash(e.target.value)}
                className="w-full bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
              />
              <Button
                className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded w-full"
                onClick={isConnected ? submitAssignment : undefined}
                disabled={!isConnected || loading}
              >
                {loading ? "Submitting..." : "Submit Assignment"}
              </Button>
              {showMessage && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Transaction Submitted</AlertTitle>
                  <AlertDescription>
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
                    <p>Please wait until the transaction is completed.</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            {isEducator && (
              <div className="w-full mt-8">
                <h2 className="text-2xl font-bold mb-4">Submissions</h2>
                {submissions.map((submission, index) => (
                  <div key={index} className="border-b py-2">
                    <p>Student: {submission.student}</p>
                    <p>Assignment Hash: {submission.assignmentHash}</p>
                    <p>Timestamp: {new Date(submission.timestamp * 1000).toLocaleString()}</p>
                    <p>Verified: {submission.verified ? "Yes" : "No"}</p>
                    {!submission.verified && (
                      <Button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded mt-2"
                        onClick={() => verifySubmission(index)}
                      >
                        Verify Submission
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!isEducator && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Student View</AlertTitle>
                <AlertDescription>
                  As a student, you can submit assignments but cannot view all submissions, only educators with ocid (edu_) can see it.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}