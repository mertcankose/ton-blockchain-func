import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type TransferContractConfig = {
    value: number;
    owner: Address;
};

export function transferContractConfigToCell(config: TransferContractConfig): Cell {
    return beginCell()
        .storeUint(config.value, 64)
        .storeAddress(config.owner)
        .endCell();
}

export class TransferContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

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
            body: beginCell().endCell(), // Boş mesaj ile deploy
        });
    }

    // Get contract data (value, owner address)
    async getContractData(provider: ContractProvider) {
        try {
            const { stack } = await provider.get('get_contract_data', []);
            return {
                value: stack.readNumber(),
                owner: stack.readAddress(),
            };
        } catch (error) {
            console.error('Error reading contract data:', error);
            return {
                value: 0,
                owner: Address.parse("EQA...") // Default address
            };
        }
    }

    // Get only value
    async getValue(provider: ContractProvider) {
        const { stack } = await provider.get('get_value', []);
        return stack.readNumber();
    }

    // Get owner address
    async getOwner(provider: ContractProvider) {
        const { stack } = await provider.get('get_owner', []);
        return stack.readAddress();
    }

    // Increment the counter (anyone can call)
    async sendIncrement(provider: ContractProvider, via: Sender, value: number) {
        const INCREMENT_FEE = toNano('0.01');
        console.log('Sending increment with value:', value);
        console.log('Operation code:', 1);
        
        await provider.internal(via, {
            value: INCREMENT_FEE,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 4)
                .storeUint(value, 64)
                .endCell(),
        });
    }

    // Withdraw funds (only owner)
    async sendWithdraw(provider: ContractProvider, via: Sender) {
        const MIN_TON = BigInt(10000000); // 0.01 TON for fees
        await provider.internal(via, {
            value: MIN_TON,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 4) // op::withdraw = 2
                .endCell(),
        });
    }

    // Change owner (only current owner)
    async sendChangeOwner(provider: ContractProvider, via: Sender, newOwner: Address) {
        const MIN_TON = BigInt(10000000); // 0.01 TON for fees
        await provider.internal(via, {
            value: MIN_TON,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(3, 4) // op::change_owner = 3
                .storeAddress(newOwner)
                .endCell(),
        });
    }
}