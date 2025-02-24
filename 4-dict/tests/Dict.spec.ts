import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Dict } from '../wrappers/Dict';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Dict', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Dict');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let dict: SandboxContract<Dict>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        dict = blockchain.openContract(Dict.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await dict.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: dict.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and dict are ready to use
    });
});
