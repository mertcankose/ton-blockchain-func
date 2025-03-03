import { Address, fromNano, toNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_ADDRESS = "EQAgFFbyxbVkh_j3ERptIxfqiL92RdSGQJ0WNPrwodwHeaUk";

export async function run(provider: NetworkProvider) {
  try {
    console.log('Checking claimable tokens...');
    
    // VestingWallet kontratını aç
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    // Claim edilebilir miktarı kontrol et
    const claimableAmount = await vestingWallet.getClaimableAmount();
    
    if (claimableAmount <= 0n) {
      console.log('No tokens available to claim at this time.');
      return { success: false, reason: 'No claimable tokens' };
    }
    
    console.log(`\nClaiming ${fromNano(claimableAmount)} unlocked tokens...`);
    
    
    let jettonWalletAddress = Address.parse("EQAxRhj44YvQRXhatFc1vpJy2OS9i0Y_v0RJVp8BQ5KrPAcc");
    
    const forwardTonAmount = toNano('0.5');
    const result = await vestingWallet.claimUnlocked(
      provider.provider(walletAddress),
      provider.sender(),
      {
        forwardTonAmount,
        jettonWalletAddress
      }
    );
    
    console.log('Claim transaction sent successfully!');
    console.log(`Claimed amount: ${fromNano(claimableAmount)} tokens`);
    
    // Remaining claim kontrolü
    try {
      const remainingClaimable = await vestingWallet.getClaimableAmount();
      if (remainingClaimable > 0n) {
        console.log(`\nNote: There are still ${fromNano(remainingClaimable)} tokens available to claim.`);
      }
    } catch (e) {
      // Ignore error
    }
    
    return {
      success: true,
      amount: fromNano(claimableAmount),
    };
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
}