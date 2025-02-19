import { toNano } from '@ton/core';
import { TransferContract } from '../wrappers/TransferContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const transferContract = provider.open(TransferContract.createFromConfig({
        value: 0,
    }, await compile('TransferContract')));

    await transferContract.sendDeploy(provider.sender(), toNano('0.01'));

    await provider.waitForDeploy(transferContract.address);

    // run methods on `transferContract`
}
