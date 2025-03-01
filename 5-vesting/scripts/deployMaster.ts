// scripts/deploy-master.ts
import { toNano, fromNano } from '@ton/core';
import { VestingMaster } from '../wrappers/VestingMaster';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  try {
    // Önce wallet kodunu derle
    console.log('Compiling Vesting Wallet code...');
    const walletCode = await compile('VestingWallet');
    
    // Sonra master kontratını oluştur
    console.log('Creating Vesting Master contract...');
    const vestingMaster = provider.open(
      VestingMaster.createFromConfig({
        owner_address: provider.sender().address!,
        vesting_wallet_code: walletCode,
        total_wallets_created: 0,
        total_royalty_collected: 0n
      },
      await compile('VestingMaster'))
    );
    
    const DEPLOY_AMOUNT = toNano('0.3');

    console.log('Deploying Vesting Master contract...');
    console.log('Contract address:', vestingMaster.address.toString());

    // Deploy contract
    await vestingMaster.sendDeploy(provider.sender(), DEPLOY_AMOUNT);

    // Wait for deploy transaction to complete
    console.log('Waiting for deploy transaction...');
    await provider.waitForDeploy(vestingMaster.address);
  
    // Verify stats
    try {
      const stats = await vestingMaster.getVestingStats();
      const royaltyFee = await vestingMaster.getRoyaltyFee();
    
      console.log('Vesting Master deployed successfully!');
      console.log('Contract address:', vestingMaster.address.toString());
      console.log('Owner address:', provider.sender().address!.toString());
      console.log('Royalty fee per wallet creation:', fromNano(royaltyFee), 'TON');
      console.log('Current statistics:');
      console.log('- Total wallets created:', stats.totalWalletsCreated);
      console.log('- Total royalty collected:', fromNano(stats.totalRoyaltyCollected), 'TON');
    } catch (e) {
      console.log('Vesting Master deployed successfully!');
      console.log('Contract address:', vestingMaster.address.toString());
      console.log('Could not verify contract stats after deploy.');
    }

    console.log('\nNext steps:');
    console.log('1. Update master address in your script files to:', vestingMaster.address.toString());
    console.log('2. Create vesting wallets with:');
    console.log('   npx blueprint run create-vesting');
    
    return {
      success: true,
      address: vestingMaster.address.toString(),
    };

  } catch (error) {
    console.error('Error deploying Vesting Master contract:', error);
    throw error;
  }
}