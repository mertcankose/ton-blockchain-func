// scripts/wallet-info.ts
import { Address, fromNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_ADDRESS = "EQCLej5yn2szQqUrjh-nAqMRoZLL2piPWY1J5Jndl_2fFCvO";

// Tarih formatı
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Süre formatı
function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

export async function run(provider: NetworkProvider) {
  try {
    console.log('Fetching Vesting Wallet information...');
    
    // VestingWallet kontratını aç
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    // Bilgileri al
    const vestingData = await vestingWallet.getVestingData();
    console.log("vestingData", vestingData);
    const owner = await vestingWallet.getOwner();
    console.log("owner", owner);
    const currentUnlocked = await vestingWallet.getCurrentUnlockedAmount();
    console.log("currentUnlocked", currentUnlocked);
    const currentLocked = await vestingWallet.getCurrentLockedAmount();
    console.log("currentLocked", currentLocked);
    const claimedAmount = await vestingWallet.getClaimedAmount();
    console.log("claimedAmount", claimedAmount);
    const claimableAmount = await vestingWallet.getClaimableAmount();
    console.log("claimableAmount", claimableAmount);
    
    // Jetton wallet adresini al
    let jettonWalletAddress;
    try {
      jettonWalletAddress = await vestingWallet.getJettonWalletAddress();
    } catch (e) {
      jettonWalletAddress = "Could not retrieve jetton wallet address";
    }
    
    console.log('\n===== VESTING WALLET INFORMATION =====');
    console.log('Wallet Address:', walletAddress.toString());
    console.log('Owner Address:', owner.toString());
    console.log('Jetton Master:', vestingData.jettonMasterAddress.toString());
    
    if (typeof jettonWalletAddress !== "string") {
      console.log('Jetton Wallet:', jettonWalletAddress.toString());
    } else {
      console.log('Jetton Wallet:', jettonWalletAddress);
    }
  
    
    console.log('\n--- Vesting Schedule ---');
    console.log('Start Time:', formatDate(vestingData.vestingStartTime));
    console.log('Total Duration:', formatDuration(vestingData.vestingTotalDuration));
    console.log('Unlock Period:', formatDuration(vestingData.unlockPeriod));
    console.log('Cliff Duration:', formatDuration(vestingData.cliffDuration));
    console.log('End Time:', formatDate(vestingData.vestingStartTime + vestingData.vestingTotalDuration));
    
    console.log('\n--- Token Amounts ---');
    console.log('Total Amount:', fromNano(vestingData.vestingTotalAmount), 'tokens');
    console.log('Currently Locked:', fromNano(currentLocked), 'tokens');
    console.log('Currently Unlocked:', fromNano(currentUnlocked), 'tokens');
    console.log('Claimed Amount:', fromNano(claimedAmount), 'tokens');
    console.log('Claimable Amount:', fromNano(claimableAmount), 'tokens');
    
    const now = Math.floor(Date.now() / 1000);
    const progress = Math.min(
      100,
      Math.max(0, (now - vestingData.vestingStartTime) / vestingData.vestingTotalDuration * 100)
    );
    
    console.log('\nVesting Progress: ~', progress.toFixed(2), '%');
    
    return {
      success: true,
      data: {
        address: walletAddress.toString(),
        owner: owner.toString(),
        jettonMaster: vestingData.jettonMasterAddress.toString(),
        totalAmount: fromNano(vestingData.vestingTotalAmount),
        startTime: vestingData.vestingStartTime,
        totalDuration: vestingData.vestingTotalDuration,
        unlockPeriod: vestingData.unlockPeriod,
        cliffDuration: vestingData.cliffDuration,
        locked: fromNano(currentLocked),
        unlocked: fromNano(currentUnlocked),
        claimed: fromNano(claimedAmount),
        claimable: fromNano(claimableAmount)
      }
    };
  } catch (error) {
    console.error('Error fetching wallet information:', error);
    throw error;
  }
}