// scripts/send-tokens.ts
import { Address, toNano, fromNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_ADDRESS = "EQCLej5yn2szQqUrjh-nAqMRoZLL2piPWY1J5Jndl_2fFCvO";

const RECIPIENT_ADDRESS = "0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj";

const TOKEN_AMOUNT = "10";

export async function run(provider: NetworkProvider) {
  try {
    // Parametreleri ayarla
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const recipientAddress = Address.parse(RECIPIENT_ADDRESS);
    const amount = toNano(TOKEN_AMOUNT);
    
    console.log(`Sending ${TOKEN_AMOUNT} tokens from ${walletAddress.toString()} to ${recipientAddress.toString()}...`);
    
    // VestingWallet kontratını aç
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    // Kilitli miktarı kontrol et
    const lockedAmount = await vestingWallet.getCurrentLockedAmount();
    const totalAmount = await vestingWallet.getVestingData().then(data => data.vestingTotalAmount);
    
    // Whitelist kontrolü
    const isWhitelisted = await vestingWallet.getIsWhitelisted(recipientAddress);
    
    if (amount > (Number(totalAmount) - Number(lockedAmount)) && !isWhitelisted) {
      console.log('\nWARNING: Attempting to send locked tokens to a non-whitelisted address.');
      console.log('This transaction will likely fail. Consider adding the recipient to whitelist first.');
    }
    
    // Jetton wallet adresini al
    let jettonWalletAddress;
    try {
      jettonWalletAddress = await vestingWallet.getJettonWalletAddress();
      console.log('Found jetton wallet address:', jettonWalletAddress.toString());
    } catch (e) {
      console.log('Could not retrieve jetton wallet address, proceeding without it...');
    }
    
    // Transfer işlemini gerçekleştir
    const forwardAmount = toNano('1'); // 0.01 TON for recipient
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