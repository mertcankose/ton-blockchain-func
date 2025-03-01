import { Address, toNano, fromNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_ADDRESS = "EQCiSBcd0CTIaw4crOY_0jJ6VIVUYdpjVX8Wdd8M8jVw8HX7";

const RECIPIENT_ADDRESS = "0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj";

const TOKEN_AMOUNT = "50";

export async function run(provider: NetworkProvider) {
  try {
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const recipientAddress = Address.parse(RECIPIENT_ADDRESS);
    const amount = toNano(TOKEN_AMOUNT);
    
    console.log(`Sending ${TOKEN_AMOUNT} tokens from ${walletAddress.toString()} to ${recipientAddress.toString()}...`);
    
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    const lockedAmount = await vestingWallet.getCurrentLockedAmount();
    const totalAmount = await vestingWallet.getVestingData().then(data => data.vestingTotalAmount);
    
    const isWhitelisted = await vestingWallet.getIsWhitelisted(recipientAddress);
    
    if (amount > (Number(totalAmount) - Number(lockedAmount)) && !isWhitelisted) {
      console.log('\nWARNING: Attempting to send locked tokens to a non-whitelisted address.');
      console.log('This transaction will likely fail. Consider adding the recipient to whitelist first.');
    }
    
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