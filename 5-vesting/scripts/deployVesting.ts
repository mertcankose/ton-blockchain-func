import { toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { compile, NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';
import { JETTON_MASTER_ADDRESS } from '../key';

export async function run(provider: NetworkProvider) {
    try {
        const jettonMasterAddress = Address.parse(JETTON_MASTER_ADDRESS);
        const now = Math.floor(Date.now() / 1000);

        const vestingContract = provider.open(
            Vesting.createFromConfig({
                vesting_total_amount: toNano('0'), // 0 JETTON, when transfer jetton to contract increase this value
                vesting_start_time: now, 
                vesting_total_duration: 60 * 60, // 1 hour
                unlock_period: 6 * 60, // 6 minutes
                cliff_duration: 0,
                vesting_sender_address: provider.sender().address!,
                owner_address: provider.sender().address!,
                seqno: 0,
                jetton_master_address: jettonMasterAddress,
            }, 
            await compile('Vesting'))
        );
        const DEPLOY_AMOUNT = toNano('0.01');

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