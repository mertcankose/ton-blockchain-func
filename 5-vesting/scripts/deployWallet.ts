// scripts/deploy-wallet.ts
import { toNano, Address, fromNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';
import { compile } from '@ton/blueprint';

const JETTON_MASTER_ADDRESS = "EQA-EpakmTO_KBPX_NrSY88qS7vqdWKChc-VMtFK0CnSPUwr";

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

export async function run(provider: NetworkProvider) {
    try {
        // User who is deploying will be the owner
        const ownerAddress = provider.sender().address!;
        
        const VESTING_AMOUNT = toNano("100"); // 1000 tokens initial vesting amount
        const START_DELAY = 3600; // 1 hour
        const TOTAL_DURATION = 30 * 86400; // 30 days
        const UNLOCK_PERIOD = 86400; // 1 day
        const CLIFF_DURATION = 7 * 86400; // 7 days
        
        // Create and deploy Vesting Wallet with hard-coded parameters
        console.log('Deploying Vesting Wallet with pre-defined parameters...');
        
        // Compile wallet code
        const walletCode = await compile('VestingWallet');
        
        // Calculate start time
        const now = Math.floor(Date.now() / 1000);
        const startTime = now + START_DELAY;
        
        // Create a custom config
        const config = {
            owner_address: ownerAddress,
            jetton_master_address: Address.parse(JETTON_MASTER_ADDRESS),
            vesting_total_amount: VESTING_AMOUNT,
            vesting_start_time: startTime,
            vesting_total_duration: TOTAL_DURATION,
            unlock_period: UNLOCK_PERIOD,
            cliff_duration: CLIFF_DURATION,
            claimed_amount: 0n
        };
        
        // Create wallet instance with our config
        const vestingWallet = provider.open(
            VestingWallet.createFromConfig(config, walletCode)
        );
        
        const DEPLOY_AMOUNT = toNano('0.05');
        
        console.log('Contract address:', vestingWallet.address.toString());
        console.log('\nDeploying with these pre-defined parameters:');
        console.log('- Owner:', ownerAddress.toString());
        console.log('- Jetton Master:', JETTON_MASTER_ADDRESS);
        console.log('- Vesting Total Amount:', fromNano(VESTING_AMOUNT), 'tokens');
        console.log('- Start Time:', formatDate(startTime));
        console.log('- Total Duration:', formatDuration(TOTAL_DURATION));
        console.log('- Unlock Period:', formatDuration(UNLOCK_PERIOD));
        console.log('- Cliff Duration:', formatDuration(CLIFF_DURATION));
        
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
            console.log('Vesting Total Amount:', fromNano(vestingData.vestingTotalAmount), 'tokens');
            console.log('Claimed Amount:', fromNano(vestingData.claimedAmount), 'tokens');

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
        
        return {
            success: true,
            address: vestingWallet.address.toString(),
        };
        
    } catch (error) {
        console.error('Error deploying Vesting Wallet:', error);
        throw error;
    }
}