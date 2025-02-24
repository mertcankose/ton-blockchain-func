import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

// Operation codes from the contract
export const DictOpcodes = {
    getCounter: 0x1234,
    setCounter: 0x2345,
    increment: 0x3456,
    decrement: 0x4567,
    getTotal: 0x5678,
} as const;

export type DictConfig = {};

export function dictConfigToCell(config: DictConfig): Cell {
    return beginCell().endCell();
}

export class Dict implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Dict(address);
    }

    static createFromConfig(config: DictConfig, code: Cell, workchain = 0) {
        const data = dictConfigToCell(config);
        const init = { code, data };
        return new Dict(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    /**
     * Get counter value for a specific address
     */
    async getCounter(provider: ContractProvider, via: Sender, targetAddress: Address, value: bigint) {
        const result = await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(DictOpcodes.getCounter, 32)
                .storeAddress(targetAddress)
                .endCell(),
        });
        return result;
    }

    /**
     * Set counter value for an address
     */
    async setCounter(provider: ContractProvider, via: Sender, targetAddress: Address, newValue: number, value: bigint) {
        const result = await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(DictOpcodes.setCounter, 32)
                .storeAddress(targetAddress)
                .storeUint(newValue, 256)
                .endCell(),
        });
        return result;
    }

    /**
     * Increment counter for an address
     */
    async increment(provider: ContractProvider, via: Sender, targetAddress: Address, value: bigint) {
        const result = await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(DictOpcodes.increment, 32)
                .storeAddress(targetAddress)
                .endCell(),
        });
        return result;
    }

    /**
     * Decrement counter for an address
     */
    async decrement(provider: ContractProvider, via: Sender, targetAddress: Address, value: bigint) {
        const result = await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(DictOpcodes.decrement, 32)
                .storeAddress(targetAddress)
                .endCell(),
        });
        return result;
    }

    /**
     * Get total number of addresses in the system
     */
    async getTotal(provider: ContractProvider, via: Sender, value: bigint) {
        const result = await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(DictOpcodes.getTotal, 32)
                .endCell(),
        });
        return result;
    }

    /**
     * Get Methods
     */

    async getCounterValue(provider: ContractProvider, address: Address) {
        const result = await provider.get('counter_value', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
        ]);
        return result.stack.readNumber();
    }

    async getTotalAddresses(provider: ContractProvider) {
        const result = await provider.get('total_addresses', []);
        return result.stack.readNumber();
    }
}
