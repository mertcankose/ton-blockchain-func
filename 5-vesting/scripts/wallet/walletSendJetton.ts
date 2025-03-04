import { Address, toNano, fromNano } from '@ton/core';
import { VestingWallet } from '../../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_CONTRACT_ADDRESS = "EQBJ7lGxxA2Usi1yEv3t_0ZbDQA1nuWmOpyT_K0S8WVJzrYi";
const RECIPIENT_ADDRESS = "0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj";

const TOKEN_AMOUNT = "50";

export async function run(provider: NetworkProvider) {
  try {
    const walletAddress = Address.parse(WALLET_CONTRACT_ADDRESS);
    const recipientAddress = Address.parse(RECIPIENT_ADDRESS);
    const amount = toNano(TOKEN_AMOUNT);
    
    console.log(`Sending ${TOKEN_AMOUNT} tokens from ${walletAddress.toString()} to ${recipientAddress.toString()}...`);
    
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    let jettonWalletAddress = Address.parse("EQBuor-j5UJTYxyPO7d3mHXdoJSK-8XrszCxmym3cfw2WFMu");
    
    const forwardAmount = toNano('0.05'); // 0.01 TON for recipient
    const result = await vestingWallet.sendJettons(provider.sender(), {
      toAddress: recipientAddress,
      jettonAmount: amount,
      forwardTonAmount: forwardAmount,
      jettonWalletAddress
    });
    
    console.log('Token transfer transaction sent successfully!');
    
    return {
      success: true,
      from: walletAddress.toString(),
      to: recipientAddress.toString(),
      amount: TOKEN_AMOUNT,
    };
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw error;
  }
}