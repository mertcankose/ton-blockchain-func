import { toNano } from '@ton/core';
import { TransferContract } from '../wrappers/TransferContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    try {
        const transferContract = provider.open(
            TransferContract.createFromConfig({
                value: 0,
                owner: provider.sender().address!,
                jettonBalance: 0n
            }, 
            await compile('TransferContract'))
        );

        // Deploy için gereken minimum miktar (0.1 TON önerilen)
        const DEPLOY_AMOUNT = toNano('0.01');

        console.log('Deploying contract...');
        console.log('Contract address:', transferContract.address.toString());

        // Kontratı deploy et
        await transferContract.sendDeploy(provider.sender(), DEPLOY_AMOUNT);

        // Deploy'un tamamlanmasını bekle
        console.log('Waiting for deploy transaction...');
        await provider.waitForDeploy(transferContract.address);

        // Deploy sonrası kontrat verilerini kontrol et
        const contractData = await transferContract.getContractData();
        
        console.log('Contract deployed successfully!');
        console.log('Initial value:', contractData.value);
        console.log('Contract owner:', contractData.owner.toString());
        console.log('Jetton balance:', contractData.jettonBalance.toString());
        return {
            success: true,
            address: transferContract.address.toString(),
            owner: contractData.owner.toString(),
            initialValue: contractData.value,
            jettonBalance: contractData.jettonBalance.toString()
        };

    } catch (error) {
        console.error('Error deploying contract:', error);
        throw error;
    }
}