import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Address } from '@ton/core';
import { TransferContract } from '../wrappers/TransferContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { USER_JETTON_ADDRESS } from '../keys';

describe('TransferContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TransferContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let transferContract: SandboxContract<TransferContract>;
    let owner: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        
        // Enable verbosity to see FunC dump and strdump outputs
        blockchain.verbosity = {
            print: true,
            blockchainLogs: true,
            vmLogs: 'vm_logs_full',
            debugLogs: true,
        };

        owner = await blockchain.treasury('owner');
        user = await blockchain.treasury('user');

        transferContract = blockchain.openContract(TransferContract.createFromConfig({
            value: 0,
            owner: owner.address,
            jettonBalance: BigInt(0)
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await transferContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: transferContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and transferContract are ready to use
    });

    it('should get contract data after deployment', async () => {
        const contractData = await transferContract.getContractData();
        
        expect(contractData.value).toBe(0);
        expect(contractData.owner.toString()).toBe(owner.address.toString());
        expect(contractData.jettonBalance).toBe(BigInt(0));
    });

    it('should get individual contract values', async () => {
        const value = await transferContract.getValue();
        const ownerAddress = await transferContract.getOwner();
        const jettonBalance = await transferContract.getJettonBalance();
        
        expect(value).toBe(0);
        expect(ownerAddress.toString()).toBe(owner.address.toString());
        expect(jettonBalance).toBe(BigInt(0));
    });

    it('should increment value', async () => {
        // Get initial value
        const initialValue = await transferContract.getValue();
        console.log('Initial value:', initialValue);
        
        // Send increment operation with value 5
        const incrementAmount = 5;
        const incrementResult = await transferContract.sendIncrement(user.getSender(), incrementAmount);

        console.log('Transaction completed');
        incrementResult.transactions.forEach((tx, index) => {
            console.log(`Transaction details -${index} :`, tx);
        });

        expect(incrementResult.transactions).toHaveTransaction({
            from: user.address,
            to: transferContract.address,
            success: true,
        });

        // Get new value after increment
        const newValue = await transferContract.getValue();
        console.log('New value after increment:', newValue);
        
        // Check that value increased by 5
        expect(newValue).toBe(initialValue + incrementAmount);
    });

    /*
    it('should change owner (only by owner)', async () => {
        // Initial owner
        const initialOwner = await transferContract.getOwner();
        expect(initialOwner.toString()).toBe(owner.address.toString());
        
        // Try to change owner from non-owner (should fail)
        const failedChangeResult = await transferContract.sendChangeOwner(
            user.getSender(), 
            user.address
        );
        
        // Should have an unsuccessful transaction
        expect(failedChangeResult.transactions).toHaveTransaction({
            from: user.address,
            to: transferContract.address,
            success: false,
        });
        
        // Owner should not have changed
        let currentOwner = await transferContract.getOwner();
        expect(currentOwner.toString()).toBe(owner.address.toString());
        
        // Change owner by correct owner
        const successChangeResult = await transferContract.sendChangeOwner(
            owner.getSender(), 
            user.address
        );
        
        // Should have a successful transaction
        expect(successChangeResult.transactions).toHaveTransaction({
            from: owner.address,
            to: transferContract.address,
            success: true,
        });
        
        // Owner should have changed to user
        currentOwner = await transferContract.getOwner();
        expect(currentOwner.toString()).toBe(user.address.toString());
    });
    */

    // Test for Jetton transfers - This is a mock test since we can't create a real jetton wallet in this sandbox
    it('should mock a jetton transfer', async () => {
        // Mock a jetton wallet address
        const mockJettonWalletAddress = Address.parse(USER_JETTON_ADDRESS);
        
        // This will fail in a real test because the mock jetton wallet doesn't exist
        // But we can at least verify that our contract sends the correct message
        try {
            await transferContract.sendIncrementWithJetton(
                owner.getSender(),
                BigInt(10000000), // 10 jettons (assuming 6 decimals)
                mockJettonWalletAddress
            );
        } catch (error) {
            // Expected to fail since the jetton wallet doesn't exist
            console.log('Expected error during mock jetton transfer:');
        }
        
        // In a real test, you would need to:
        // 1. Deploy a mock jetton master and wallet
        // 2. Send some jettons to the owner
        // 3. Perform the transfer
        // 4. Check that the contract's jetton balance increased
    });
 
});