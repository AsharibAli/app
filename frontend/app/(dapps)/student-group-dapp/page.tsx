'use client'

import React, { useState, useEffect } from 'react'
import Web3 from 'web3'
import contractABI from '@/contracts/StudyGroup.sol/StudyGroup.json'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useOCAuth } from '@opencampus/ocid-connect-js'
import { jwtDecode } from 'jwt-decode'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginButton from '@/components/LoginButton'

interface Message {
  sender: string
  content: string
  timestamp: number
}

interface DecodedToken {
  edu_username: string
  [key: string]: any
}

const contractAddress = '0x158f83cD37e7774b520ADCb9BD7bc80330378c1B' // Replace with your deployed contract address

export default function StudyGroup() {
  const { authState } = useOCAuth()
  const { toast } = useToast()

  // State variables
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [contract, setContract] = useState<any>(null)
  const [account, setAccount] = useState<string>('')
  const [isMember, setIsMember] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [ocidUsername, setOcidUsername] = useState<string | null>(null)
  const [mmStatus, setMmStatus] = useState<string>("Not connected!")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [getNetwork, setGetNetwork] = useState<number | undefined>(undefined)

  // Function to switch network
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

  // Function to connect wallet
  const ConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await switchToOpenCampusNetwork();

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
        setAccount(accounts[0]);
        setMmStatus("Connected!");
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Effect to initialize Web3, set up contract, and handle network changes
  useEffect(() => {
    if (authState.idToken) {
      const decodedToken = jwtDecode<DecodedToken>(authState.idToken)
      setOcidUsername(decodedToken.edu_username)
    }

    const initWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Instance = new Web3(window.ethereum)
        setWeb3(web3Instance)

        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' })
          const accounts = await web3Instance.eth.getAccounts()
          setAccount(accounts[0])

          const contractInstance = new web3Instance.eth.Contract(contractABI.abi, contractAddress)
          setContract(contractInstance)

          const memberStatus = await contractInstance.methods.getMemberStatus(accounts[0]).call()
          setIsMember(Boolean(memberStatus))

          await loadMessages()
        } catch (error) {
          console.error('Failed to connect to wallet:', error)
          toast({
            title: 'Error',
            description: 'Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'MetaMask not detected',
          description: 'Please install MetaMask to use this dApp.',
          variant: 'destructive',
        })
      }
    }

    initWeb3()

    // Listen for network changes
    const handleNetworkChange = async () => {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (chainId !== "0xa045c") {
        alert("You have switched to an incorrect network. Please switch back to the Open Campus Codex network.");
        setIsConnected(false);
        setAccount('');
      }
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleNetworkChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleNetworkChange);
      }
    };
  }, [authState.idToken])

  const loadMessages = async () => {
    if (contract) {
      const fetchedMessages = await contract.methods.getMessages().call()
      setMessages(fetchedMessages)
    }
  }

  const joinGroup = async () => {
    if (contract && account) {
      try {
        await contract.methods.joinGroup().send({ from: account })
        setIsMember(true)
        toast({
          title: 'Success',
          description: 'You have joined the study group!',
        })
      } catch (error) {
        console.error('Failed to join group:', error)
        toast({
          title: 'Error',
          description: 'Failed to join the study group. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const sendMessage = async () => {
    if (contract && account && newMessage.trim()) {
      try {
        await contract.methods.sendMessage(newMessage).send({ from: account })
        setNewMessage('')
        await loadMessages()
        toast({
          title: 'Success',
          description: 'Message sent successfully!',
        })
      } catch (error) {
        console.error('Failed to send message:', error)
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold mt-4">
              📚 Study Group Chat Dapp 📚
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
            {isConnected ? (
              <p className="text-center text-xl">
                Connected to wallet address: <strong>{account}</strong>
              </p>
            ) : (
              <Button
                className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
                onClick={ConnectWallet}
              >
                Connect with MetaMask
              </Button>
            )}
            {!isMember && isConnected && (
              <Button
                onClick={joinGroup}
                className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
              >
                Join Study Group
              </Button>
            )}
            {isMember && (
              <>
                <div className="flex flex-col items-center">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-80 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
                  />
                  <div className="flex space-x-4">
                    <Button
                      onClick={sendMessage}
                      className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
                <div className="space-y-4 mt-6 w-full">
                  {messages.map((msg, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded shadow-sm">
                      <p className="font-semibold">{msg.sender}</p>
                      <p>{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(Number(msg.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
