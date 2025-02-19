import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TestContract } from '../wrappers/TestContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TestContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let testContract: SandboxContract<TestContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        
        // Verbosity'i açıyoruz - FunC'taki dump ve strdump çıktılarını görmek için
        blockchain.verbosity = {
            print: true,
            blockchainLogs: true,
            vmLogs: 'vm_logs_full',
            debugLogs: true,
        };

        testContract = blockchain.openContract(TestContract.createFromConfig({
            value: 0  // Başlangıç değeri olarak 0 veriyoruz
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await testContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and testContract are ready to use
    });

    it('should increase value', async () => {
        // Önce mevcut değeri al
        const initialValue = await testContract.getCurrentValue();
        console.log('Initial value:', initialValue);
        
        const increaseResult = await testContract.sendIncreaseValue(deployer.getSender(), {
            value: toNano('0.002'),
            increaseBy: 1
        });

        console.log('Transaction completed');
        console.log('Transaction details:', increaseResult.transactions);

        expect(increaseResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testContract.address,
            success: true,
        });

        // İşlemden sonra yeni değeri al
        const newValue = await testContract.getCurrentValue();
        console.log('New value after increase:', newValue);
        
        // Değerin 1 arttığını kontrol et
        expect(newValue).toBe(initialValue + 1);
    });

    it('should get current value', async () => {
        const currentValue = await testContract.getCurrentValue();
        expect(currentValue).toBe(0);
    });

    
});
