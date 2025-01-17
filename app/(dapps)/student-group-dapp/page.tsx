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
import { MetaMaskConnect } from '@/components/MetaMaskConnect'

interface Message {
  sender: string
  content: string
  timestamp: number
}

interface DecodedToken {
  edu_username: string
  [key: string]: any
}

const contractAddress = '0x82E7ADFe34DC795475582133Ffe91147f22e0c39'

export default function StudyGroup() {
  const { authState } = useOCAuth()
  const { toast } = useToast()

  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [contract, setContract] = useState<any>(null)
  const [account, setAccount] = useState<string>('')
  const [isMember, setIsMember] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [ocidUsername, setOcidUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    if (authState.idToken) {
      const decodedToken = jwtDecode<DecodedToken>(authState.idToken)
      setOcidUsername(decodedToken.edu_username)
    }
  }, [authState.idToken])

  const handleConnect = async (address: string) => {
    try {
      const web3Instance = new Web3(window.ethereum)
      setWeb3(web3Instance)
      setAccount(address)
      setIsConnected(true)

      const contractInstance = new web3Instance.eth.Contract(contractABI.abi, contractAddress)
      setContract(contractInstance)

      const memberStatus = await contractInstance.methods.getMemberStatus(address).call()
      setIsMember(Boolean(memberStatus))

      await loadMessages()
    } catch (error) {
      console.error('Failed to initialize web3 or contract:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect to wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = () => {
    setWeb3(null)
    setContract(null)
    setAccount('')
    setIsConnected(false)
    setIsMember(false)
    setMessages([])
  }

  const loadMessages = async () => {
    if (contract) {
      try {
        const fetchedMessages = await contract.methods.getMessages().call()
        setMessages(fetchedMessages)
      } catch (error) {
        console.error('Failed to load messages:', error)
        toast({
          title: 'Error',
          description: 'Failed to load messages. Please try again.',
          variant: 'destructive',
        })
      }
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

  // Auto-refresh messages
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected && contract) {
      interval = setInterval(loadMessages, 5000)
    }
    return () => clearInterval(interval)
  }, [isConnected, contract])

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

            <MetaMaskConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />

            {isConnected && !isMember && (
              <Button
                className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                onClick={joinGroup}
              >
                Join Study Group
              </Button>
            )}

            {isConnected && isMember && (
              <div className="w-full space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.sender.toLowerCase() === account.toLowerCase()
                          ? 'bg-teal-100 ml-auto'
                          : 'bg-gray-100'
                      } max-w-[80%] break-words`}
                    >
                      <p className="text-sm text-gray-500">
                        {message.sender.slice(0, 6)}...{message.sender.slice(-4)}
                      </p>
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(Number(message.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-grow"
                  />
                  <Button
                    className="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                    onClick={sendMessage}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
