// scripts/master-info.ts
import { Address, fromNano } from '@ton/core';
import { VestingMaster } from '../wrappers/VestingMaster';
import { NetworkProvider } from '@ton/blueprint';

const MASTER_CONTRACT_ADDRESS = "EQAOLJnZaOfOwnsYj18bujPzbsTdWgQdF-FTXkUKT-N-5uci";

export async function run(provider: NetworkProvider) {
  try {
    console.log('Fetching Vesting Master information...');
    
    // VestingMaster kontratını aç
    const masterAddress = Address.parse(MASTER_CONTRACT_ADDRESS);
    const vestingMaster = provider.open(VestingMaster.createFromAddress(masterAddress));
    
    // Bilgileri al
    const owner = await vestingMaster.getOwner();
    const royaltyFee = await vestingMaster.getRoyaltyFee();
    const stats = await vestingMaster.getVestingStats();
    
    console.log('\n===== VESTING MASTER INFORMATION =====');
    console.log('Contract Address:', masterAddress.toString());
    console.log('Owner Address:', owner.toString());
    console.log('Royalty Fee:', fromNano(royaltyFee), 'TON');
    console.log('Total Wallets Created:', stats.totalWalletsCreated);
    console.log('Total Royalty Collected:', fromNano(stats.totalRoyaltyCollected), 'TON');
    
    return {
      success: true,
      data: {
        address: masterAddress.toString(),
        owner: owner.toString(),
        royaltyFee: fromNano(royaltyFee),
        totalWalletsCreated: stats.totalWalletsCreated,
        totalRoyaltyCollected: fromNano(stats.totalRoyaltyCollected)
      }
    };
  } catch (error) {
    console.error('Error fetching master information:', error);
    throw error;
  }
}