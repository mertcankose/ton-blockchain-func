import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Vesting', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Vesting');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let vesting: SandboxContract<Vesting>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        vesting = blockchain.openContract(Vesting.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await vesting.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: vesting.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and vesting are ready to use
    });
});
