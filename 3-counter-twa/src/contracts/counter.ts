import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TestContractConfig = {
    value: number;
};

export function testContractConfigToCell(config: TestContractConfig): Cell {
    return beginCell().storeUint(config.value, 64).endCell();
}

export class TestContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TestContract(address);
    }

    static createFromConfig(config: TestContractConfig, code: Cell, workchain = 0) {
        const data = testContractConfigToCell(config);
        const init = { code, data };
        return new TestContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getCurrentValue(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_current_value', []);
        return result.stack.readNumber();
    }

    async sendIncreaseValue(
        provider: ContractProvider,
        via: Sender,
        params: {
            value: bigint; // TON miktarı
            increaseBy: number; // Storage'a eklenecek değer
        }
    ) {
        await provider.internal(via, {
            value: params.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(params.increaseBy, 64)
                .endCell(),
        });
    }
}
