import { Dictionary, toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';

export async function run(provider: NetworkProvider) {
    try {
        const jettonMasterAddress = Address.parse('EQCsLX9gqd0p7aG9C847wastVwvGzGSj-5r4nJT1AIe37pd5');
        const jettonWalletAddress = Address.parse("EQCN8p6k3QOW7WFcec0XJbApdnk9oNWrRdaQyt1oidkixeSD");

        const now = Math.floor(Date.now() / 1000);

        const vestingContract = provider.open(
            Vesting.createFromConfig({
                vesting_total_amount: toNano('100'), // 100 JETTON
                vesting_start_time: now, 
                vesting_total_duration: 365 * 24 * 60 * 60, // 1 year
                unlock_period: 30 * 24 * 60 * 60, // 30 days
                cliff_duration: 0,
                vesting_sender_address: provider.sender().address!,
                owner_address: provider.sender().address!,
                seqno: 0,
                jetton_master_address: jettonMasterAddress,
                jetton_wallet_address: jettonWalletAddress,
            }, 
            await compile('Vesting'))
        );

        // Increased deployment amount to ensure enough TON for successful deployment
        const DEPLOY_AMOUNT = toNano('0.05'); // Increased from 0.01 to 0.05

        console.log('Deploying contract...');
        console.log('Contract address:', vestingContract.address.toString());

        // Deploy contract
        await vestingContract.sendDeploy(provider.sender(), DEPLOY_AMOUNT);

        // Wait for deploy transaction to complete
        console.log('Waiting for deploy transaction...');
        await provider.waitForDeploy(vestingContract.address);
  
        return {
            success: true,
            address: vestingContract.address.toString(),
        };

    } catch (error) {
        console.error('Error deploying contract:', error);
        throw error;
    }
}