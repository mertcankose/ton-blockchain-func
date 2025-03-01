// scripts/deploy-wallet.ts
import { toNano, Address, fromNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';
import { compile } from '@ton/blueprint';

// Format date for nice display
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Format duration in seconds
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

export async function run(provider: NetworkProvider, args: string[]) {
    try {
        // User who is deploying will be the owner
        const ownerAddress = provider.sender().address!;
        
        // Parse optional jetton master address if provided
        let jettonMasterAddress: Address | string | undefined = undefined;
        if (args.length > 0) {
            jettonMasterAddress = args[0];
        }
        
        // Create and deploy Vesting Wallet with default parameters
        console.log('Deploying Vesting Wallet with default parameters...');
        
        // Compile wallet code
        const walletCode = await compile('VestingWallet');
        
        // Create wallet instance with default parameters
        const vestingWallet = provider.open(
            VestingWallet.createWithDefaults(
                ownerAddress, 
                walletCode,
                { jettonMasterAddress }
            )
        );
        
        const DEPLOY_AMOUNT = toNano('0.05');
        
        console.log('Contract address:', vestingWallet.address.toString());
        
        // Deploy contract
        await vestingWallet.sendDeploy(provider.sender(), DEPLOY_AMOUNT);
        
        // Wait for deploy transaction to complete
        console.log('Waiting for deploy transaction...');
        await provider.waitForDeploy(vestingWallet.address);
        
        // Get and display vesting information
        try {
            const vestingData = await vestingWallet.getVestingData();
            const owner = await vestingWallet.getOwner();
            
            console.log('\nVesting Wallet deployed successfully!');
            console.log('Owner address:', owner.toString());
            console.log('Jetton Master:', vestingData.jettonMasterAddress.toString());
            
            console.log('\n--- Vesting Schedule ---');
            console.log('Start Time:', formatDate(vestingData.vestingStartTime));
            console.log('Total Duration:', formatDuration(vestingData.vestingTotalDuration));
            console.log('Unlock Period:', formatDuration(vestingData.unlockPeriod));
            console.log('Cliff Duration:', formatDuration(vestingData.cliffDuration));
            console.log('End Time:', formatDate(vestingData.vestingStartTime + vestingData.vestingTotalDuration));
        } catch (error) {
            console.log('\nVesting Wallet deployed successfully!');
            console.log('Could not fetch additional details. The contract is deployed at:');
            console.log(vestingWallet.address.toString());
        }
        
        // Next steps guidance
        console.log('\nNext steps:');
        console.log('1. Send jettons to this wallet from your jetton wallet');
        console.log('2. Check vesting status with:');
        console.log(`   npx blueprint run manage-vesting-wallet info ${vestingWallet.address.toString()}`);
        console.log('3. Once tokens are unlocked, claim them with:');
        console.log(`   npx blueprint run manage-vesting-wallet claim ${vestingWallet.address.toString()}`);
        
        return {
            success: true,
            address: vestingWallet.address.toString(),
        };
        
    } catch (error) {
        console.error('Error deploying Vesting Wallet:', error);
        throw error;
    }
}