// scripts/claim-tokens.ts
import { Address, fromNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

// Vesting wallet adresi
const WALLET_ADDRESS = "EQATig-URAt4b6oswMYHeLO9xXDeY-M1c4OkQXsgrLlCYcY9"; // ⚠️ Buraya token claim etmek istediğiniz vesting wallet adresini yazın

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
    
    // Jetton wallet adresini al (varsa)
    let jettonWalletAddress;
    try {
      jettonWalletAddress = await vestingWallet.getJettonWalletAddress();
      console.log('Found jetton wallet address:', jettonWalletAddress.toString());
    } catch (e) {
      console.log('Could not retrieve jetton wallet address, proceeding without it...');
    }
    
    // Claim işlemini gerçekleştir
    const result = await vestingWallet.claimUnlocked(
      provider.provider(walletAddress),
      provider.sender(),
      jettonWalletAddress
    );
    
    console.log('Claim transaction sent successfully!');
    // @ts-ignore
    console.log('Transaction ID:', result.transactions[0].id);
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
      // @ts-ignore
      txid: result.transactions[0].id
    };
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
}