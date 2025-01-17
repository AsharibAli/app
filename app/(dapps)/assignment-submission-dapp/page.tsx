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
import { MetaMaskConnect } from "@/components/MetaMaskConnect";

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
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [contract, setContract] = useState<any>(undefined);
  const [ocidUsername, setOcidUsername] = useState<string | null>(null);
  const [assignmentHash, setAssignmentHash] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isEducator, setIsEducator] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (authState.idToken) {
      const decodedToken = jwtDecode<DecodedToken>(authState.idToken);
      setOcidUsername(decodedToken.edu_username);
      setIsEducator(decodedToken.edu_username.startsWith("asharib"));
    }
  }, [authState.idToken]);

  const handleConnect = async (address: string) => {
    try {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setAccountAddress(address);
      setIsConnected(true);

      const contractAddress = "0x2917CAaf110A3F3F89C2aC2DFFf4172A7eB13F27";
      const AssignmentSubmission = new web3Instance.eth.Contract(
        contractJson.abi,
        contractAddress
      );
      AssignmentSubmission.setProvider(window.ethereum);
      setContract(AssignmentSubmission);

      if (isEducator) {
        await fetchSubmissions();
      }
    } catch (error) {
      console.error("Failed to initialize web3 or contract:", error);
    }
  };

  const handleDisconnect = () => {
    setWeb3(undefined);
    setContract(undefined);
    setAccountAddress(undefined);
    setIsConnected(false);
    setSubmissions([]);
  };

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

  // Auto-refresh submissions for educators
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected && isEducator && contract) {
      interval = setInterval(fetchSubmissions, 5000);
    }
    return () => clearInterval(interval);
  }, [isConnected, isEducator, contract]);

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

            <MetaMaskConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />

            {isConnected && (
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
                  onClick={submitAssignment}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Assignment"}
                </Button>

                {isEducator && submissions.length > 0 && (
                  <div className="mt-8 w-full">
                    <h2 className="text-2xl font-bold mb-4">Submissions:</h2>
                    <div className="space-y-4">
                      {submissions.map((submission, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p>
                              <strong>Student:</strong>{" "}
                              {submission.student.slice(0, 6)}...
                              {submission.student.slice(-4)}
                            </p>
                            <p>
                              <strong>Hash:</strong> {submission.assignmentHash}
                            </p>
                            <p>
                              <strong>Time:</strong>{" "}
                              {new Date(
                                submission.timestamp * 1000
                              ).toLocaleString()}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              {submission.verified ? "Verified" : "Pending"}
                            </p>
                          </div>
                          {!submission.verified && (
                            <Button
                              className="bg-green-500 hover:bg-green-700 text-white"
                              onClick={() => verifySubmission(index)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showMessage && (
                  <>
                    <p className="text-center text-sm mt-6">
                      {loading ? "Processing..." : "Transaction sent!"}
                    </p>
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

            {!isEducator && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Student View</AlertTitle>
                <AlertDescription>
                  As a student, you can submit assignments but cannot verify submissions.
                  Only educators can verify submitted assignments.
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