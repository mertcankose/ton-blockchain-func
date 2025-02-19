import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TransferContract } from '../wrappers/TransferContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TransferContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TransferContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let transferContract: SandboxContract<TransferContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        transferContract = blockchain.openContract(TransferContract.createFromConfig({}, code));

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
});
