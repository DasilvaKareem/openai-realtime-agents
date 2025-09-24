// Thirdweb Wallet Management for OpenAI Agent SDK
// This provides wallet management capabilities using Thirdweb SDK

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { LocalWallet } from "@thirdweb-dev/wallets";
import { Ethereum, Polygon, Base, Arbitrum, Optimism } from "@thirdweb-dev/chains";

// Initialize Thirdweb SDK
const sdk = new ThirdwebSDK(Ethereum, {
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});

// Wallet instance
let wallet: LocalWallet | null = null;

export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  error?: string;
}

export const thirdwebWalletTools = {
  // Initialize or create a new wallet
  initializeWallet: async (privateKey?: string): Promise<WalletInfo> => {
    try {
      if (privateKey) {
        // Use existing private key
        wallet = new LocalWallet();
        await wallet.import({
          privateKey: privateKey,
          encryption: false,
        });
      } else {
        // Create new wallet
        wallet = new LocalWallet();
        await wallet.generate();
      }

      // Connect wallet to SDK
      await sdk.wallet.connect(wallet);

      const address = await wallet.getAddress();
      const balance = await sdk.wallet.balance();
      
      return {
        address,
        balance: balance.displayValue,
        chainId: sdk.wallet.getChainId(),
        isConnected: true,
      };
    } catch (error) {
      console.error('Wallet initialization error:', error);
      throw new Error(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get wallet information
  getWalletInfo: async (): Promise<WalletInfo> => {
    if (!wallet) {
      throw new Error('Wallet not initialized. Please call initializeWallet first.');
    }

    try {
      const address = await wallet.getAddress();
      const balance = await sdk.wallet.balance();
      
      return {
        address,
        balance: balance.displayValue,
        chainId: sdk.wallet.getChainId(),
        isConnected: true,
      };
    } catch (error) {
      console.error('Get wallet info error:', error);
      throw new Error(`Failed to get wallet info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Switch to a different chain
  switchChain: async (chainId: number): Promise<WalletInfo> => {
    if (!wallet) {
      throw new Error('Wallet not initialized. Please call initializeWallet first.');
    }

    try {
      // Switch SDK to new chain
      const chain = getChainById(chainId);
      sdk.updateChain(chain);
      
      const address = await wallet.getAddress();
      const balance = await sdk.wallet.balance();
      
      return {
        address,
        balance: balance.displayValue,
        chainId: chainId,
        isConnected: true,
      };
    } catch (error) {
      console.error('Switch chain error:', error);
      throw new Error(`Failed to switch chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Send native tokens
  sendNativeToken: async (to: string, amount: string): Promise<TransactionResult> => {
    if (!wallet) {
      throw new Error('Wallet not initialized. Please call initializeWallet first.');
    }

    try {
      const tx = await sdk.wallet.transfer(to, amount);
      
      return {
        hash: tx.receipt.transactionHash,
        success: true,
      };
    } catch (error) {
      console.error('Send native token error:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Get token balance
  getTokenBalance: async (tokenAddress: string): Promise<string> => {
    if (!wallet) {
      throw new Error('Wallet not initialized. Please call initializeWallet first.');
    }

    try {
      const contract = await sdk.getContract(tokenAddress);
      const balance = await contract.erc20.balance();
      return balance.displayValue;
    } catch (error) {
      console.error('Get token balance error:', error);
      throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Send ERC20 tokens
  sendToken: async (tokenAddress: string, to: string, amount: string): Promise<TransactionResult> => {
    if (!wallet) {
      throw new Error('Wallet not initialized. Please call initializeWallet first.');
    }

    try {
      const contract = await sdk.getContract(tokenAddress);
      const tx = await contract.erc20.transfer(to, amount);
      
      return {
        hash: tx.receipt.transactionHash,
        success: true,
      };
    } catch (error) {
      console.error('Send token error:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Disconnect wallet
  disconnectWallet: async (): Promise<void> => {
    if (wallet) {
      await wallet.disconnect();
      wallet = null;
    }
  }
};

// Helper function to get chain by ID
function getChainById(chainId: number) {
  switch (chainId) {
    case 1:
      return Ethereum;
    case 137:
      return Polygon;
    case 8453:
      return Base;
    case 42161:
      return Arbitrum;
    case 10:
      return Optimism;
    default:
      return Ethereum;
  }
}

// Tool definitions for the supervisor agent
export const thirdwebWalletToolDefinitions = [
  {
    type: "function",
    name: "initializeWallet",
    description: "Initialize or create a new Thirdweb wallet",
    parameters: {
      type: "object",
      properties: {
        privateKey: {
          type: "string",
          description: "Optional private key to import existing wallet. If not provided, a new wallet will be created."
        }
      },
      required: [],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getWalletInfo",
    description: "Get current wallet information including address, balance, and chain",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "switchChain",
    description: "Switch to a different blockchain network",
    parameters: {
      type: "object",
      properties: {
        chainId: {
          type: "number",
          description: "Chain ID to switch to (1: Ethereum, 137: Polygon, 8453: Base, 42161: Arbitrum, 10: Optimism)"
        }
      },
      required: ["chainId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "sendNativeToken",
    description: "Send native tokens (ETH, MATIC, etc.) to another address",
    parameters: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Recipient wallet address"
        },
        amount: {
          type: "string",
          description: "Amount to send in native token units (e.g., '0.1' for 0.1 ETH)"
        }
      },
      required: ["to", "amount"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "getTokenBalance",
    description: "Get balance of a specific ERC20 token",
    parameters: {
      type: "object",
      properties: {
        tokenAddress: {
          type: "string",
          description: "Contract address of the ERC20 token"
        }
      },
      required: ["tokenAddress"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "sendToken",
    description: "Send ERC20 tokens to another address",
    parameters: {
      type: "object",
      properties: {
        tokenAddress: {
          type: "string",
          description: "Contract address of the ERC20 token to send"
        },
        to: {
          type: "string",
          description: "Recipient wallet address"
        },
        amount: {
          type: "string",
          description: "Amount to send in token units"
        }
      },
      required: ["tokenAddress", "to", "amount"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "disconnectWallet",
    description: "Disconnect the current wallet",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    }
  }
];
