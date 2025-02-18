import { toNano } from '@ton/core';
import { TestContract } from '../wrappers/TestContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const testContract = provider.open(TestContract.createFromConfig({ 
        value: 0
     }, await compile('TestContract')));

    await testContract.sendDeploy(provider.sender(), toNano('0.005'));

    await provider.waitForDeploy(testContract.address);

    // run methods on `testContract`
    console.log("initial value: ", await testContract.getCurrentValue());
}
