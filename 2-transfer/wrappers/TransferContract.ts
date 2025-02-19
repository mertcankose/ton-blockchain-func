import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TransferContractConfig = {
    value: number;
};

export function transferContractConfigToCell(config: TransferContractConfig): Cell {
    return beginCell().storeUint(config.value, 64).endCell();
}

export class TransferContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TransferContract(address);
    }

    static createFromConfig(config: TransferContractConfig, code: Cell, workchain = 0) {
        const data = transferContractConfigToCell(config);
        const init = { code, data };
        return new TransferContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0, 4)  // op::init = 0, changed from 32 to 4 bits
                .endCell(),
        });
    }

    // Get contract data (value, owner address, users)
    async getContractData(provider: ContractProvider) {
        const { stack } = await provider.get('get_contract_data', []);
        const value = stack.readNumber();
        let owner;
        try {
            owner = stack.readAddress();  // Try to read as normal address first
        } catch {
            owner = null;  // If fails, set as null
        }
        const users = stack.readCell();
        return {
            value,
            owner,
            users
        };
    }

    // Get user stats (transaction count) for a specific address
    async getUserStats(provider: ContractProvider, userAddress: Address) {
        const { stack } = await provider.get('get_user_stats', [{
            type: 'slice',
            cell: beginCell().storeAddress(userAddress).endCell()
        }]);
        return stack.readNumber();
    }

    // Increment the counter
    async sendIncrement(
        provider: ContractProvider,
        via: Sender,
        value: number,
        incrementFee: bigint
    ) {
        await provider.internal(via, {
            value: incrementFee,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 4) // op::increment = 1
                .storeUint(value, 64)
                .endCell(),
        });
    }

    // Withdraw funds (only owner)
    async sendWithdraw(
        provider: ContractProvider,
        via: Sender,
        value: bigint
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 4) // op::withdraw = 2
                .storeUint(0, 64) // dummy value
                .endCell(),
        });
    }
}
