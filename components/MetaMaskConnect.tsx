"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Web3 from "web3";
import { toast } from "@/components/ui/use-toast";

interface MetaMaskConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  className?: string;
}

const OPEN_CAMPUS_CHAIN_ID = "0xa045c";

export const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({
  onConnect,
  onDisconnect,
  className = "bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4",
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    // Check localStorage for existing connection
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      checkConnection(storedAddress);
    }

    // Add event listeners for account and network changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async (storedAddress: string) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (
          accounts[0] &&
          accounts[0].toLowerCase() === storedAddress.toLowerCase()
        ) {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          if (chainId === OPEN_CAMPUS_CHAIN_ID) {
            setAccountAddress(accounts[0]);
            setIsConnected(true);
            onConnect?.(accounts[0]);
          } else {
            await switchToOpenCampusNetwork();
          }
        } else {
          handleDisconnect();
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        handleDisconnect();
      }
    }
  };

  const switchToOpenCampusNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: OPEN_CAMPUS_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: OPEN_CAMPUS_CHAIN_ID,
                  chainName: "Open Campus Codex",
                  nativeCurrency: {
                    name: "EDU",
                    symbol: "EDU",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                  blockExplorerUrls: [
                    "https://opencampus-codex.blockscout.com/",
                  ],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Open Campus Codex network:", addError);
            toast({
              variant: "destructive",
              title: "Network Error",
              description: "Failed to add Open Campus Codex network",
            });
          }
        } else {
          console.error(
            "Failed to switch to Open Campus Codex network:",
            switchError
          );
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Failed to switch to Open Campus Codex network",
          });
        }
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else if (accounts[0] !== accountAddress) {
      setAccountAddress(accounts[0]);
      setIsConnected(true);
      localStorage.setItem("walletAddress", accounts[0]);
      onConnect?.(accounts[0]);
      toast({
        title: "Account Changed",
        description: `Connected to ${accounts[0].slice(
          0,
          6
        )}...${accounts[0].slice(-4)}`,
      });
    }
  };

  const handleChainChanged = async (chainId: string) => {
    if (chainId !== OPEN_CAMPUS_CHAIN_ID) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please connect to Open Campus Codex network",
      });
      await switchToOpenCampusNetwork();
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccountAddress(undefined);
    localStorage.removeItem("walletAddress");
    onDisconnect?.();
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        variant: "destructive",
        title: "MetaMask Required",
        description: "Please install MetaMask to use this application",
      });
      return;
    }

    try {
      await switchToOpenCampusNetwork();
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      if (chainId !== OPEN_CAMPUS_CHAIN_ID) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please connect to Open Campus Codex network",
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountAddress(accounts[0]);
      setIsConnected(true);
      localStorage.setItem("walletAddress", accounts[0]);
      onConnect?.(accounts[0]);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].slice(
          0,
          6
        )}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect wallet",
      });
    }
  };

  if (isConnected && accountAddress) {
    return (
      <div className="text-center text-xl">
        <h1>
          Connected to wallet address: <strong>{accountAddress}</strong>
        </h1>
      </div>
    );
  }

  return (
    <Button className={className} onClick={connectWallet} variant="link">
      Connect with MetaMask
    </Button>
  );
};
