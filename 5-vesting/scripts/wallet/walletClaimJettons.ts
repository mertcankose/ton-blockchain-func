import { Address, fromNano, toNano } from '@ton/core';
import { VestingWallet } from '../../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_CONTRACT_ADDRESS = "EQBJ7lGxxA2Usi1yEv3t_0ZbDQA1nuWmOpyT_K0S8WVJzrYi";
const WALLET_JETTON_ADDRESS = "EQDU99ieiLW22xp29P_JtJ0xi3XTfYq-bHDUm1IljoM7QZ3j";

export async function run(provider: NetworkProvider) {
  try {
    console.log('Checking claimable tokens...');
    
    const walletAddress = Address.parse(WALLET_CONTRACT_ADDRESS);
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    const claimableAmount = await vestingWallet.getClaimableAmount();
    
    if (claimableAmount <= 0n) {
      console.log('No tokens available to claim at this time.');
      return { success: false, reason: 'No claimable tokens' };
    }
    
    console.log(`\nClaiming ${fromNano(claimableAmount)} unlocked tokens...`);
    
    let jettonWalletAddress = Address.parse(WALLET_JETTON_ADDRESS);
    
    const forwardTonAmount = toNano('0.1');
    await vestingWallet.claimUnlocked(
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