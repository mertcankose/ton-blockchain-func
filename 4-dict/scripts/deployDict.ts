import { toNano } from '@ton/core';
import { Dict } from '../wrappers/Dict';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const dict = provider.open(Dict.createFromConfig({}, await compile('Dict')));

    await dict.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(dict.address);

    // run methods on `dict`
}
