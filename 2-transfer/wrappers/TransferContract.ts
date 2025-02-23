import { Address, beginCell, Cell, Contract,internal, contractAddress, ContractProvider, Sender, SendMode, toNano, storeMessageRelaxed } from '@ton/core';

export type TransferContractConfig = {
    value: number;
    owner: Address;
    jettonBalance: bigint;
};

export function transferContractConfigToCell(config: TransferContractConfig): Cell {
    return beginCell()
        .storeUint(config.value, 64)
        .storeAddress(config.owner)
        .storeUint(config.jettonBalance, 64)
        .endCell();
}

export class TransferContract implements Contract {
    static JETTON_MASTER_ADDRESS = Address.parse("EQDH9xFK9PEWo9oAewycehyUpOZkVKVPgo3agWJ0kb5_e28T");
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

    // Get contract data (value, owner address, jetton balance)
    async getContractData(provider: ContractProvider) {
        try {
            const { stack } = await provider.get('get_contract_data', []);
            return {
                value: stack.readNumber(),
                owner: stack.readAddress(),
                jettonBalance: stack.readBigNumber(),
            };
        } catch (error) {
            console.error('Error reading contract data:', error);
            return {
                value: 0,
                owner: Address.parse("EQA"), // Default address
                jettonBalance: BigInt(0),
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

    async getJettonBalance(provider: ContractProvider) {
        const { stack } = await provider.get('get_jetton_balance', []);
        return stack.readBigNumber();
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
                .storeUint(1, 32)
                .storeUint(value, 64)
                .endCell(),
        });
    }

    async sendIncrementWithJetton(
        provider: ContractProvider, 
        via: Sender, 
        amount: bigint,
        jettonWalletAddress: Address
    ) {
        const contractAddress = Address.parse("EQDH9xFK9PEWo9oAewycehyUpOZkVKVPgo3agWJ0kb5_e28T")
        console.log('Contract address:', contractAddress.toString());
        console.log('Jetton wallet address:', jettonWalletAddress.toString());
        console.log('Amount:', amount.toString());

        const messageBody = beginCell()
            .storeUint(0x0f8a7ea5, 32)   // jetton transfer opcode
            .storeUint(0, 64)           // query id
            .storeCoins(amount)         // jetton amount
            .storeAddress(contractAddress) // destination address
            .storeAddress(contractAddress) // response destination
            .storeBit(0)               // no custom payload
            .storeCoins(0)             // forward amount
            .storeBit(0)               // no forward payload
            .endCell();

        const msg = internal({
            to: jettonWalletAddress,
            value: toNano('0.01'),
            bounce: true,
            body: messageBody
        });

        await provider.internal(via, {
            value: toNano('0.1'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().store(storeMessageRelaxed(msg)).endCell()
        });
    }

    // Withdraw funds (only owner)
    async sendWithdraw(provider: ContractProvider, via: Sender) {
        const MIN_TON = BigInt(10000000); // 0.01 TON for fees
        await provider.internal(via, {
            value: MIN_TON,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32) // op::withdraw = 2
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
                .storeUint(3, 32) // op::change_owner = 3
                .storeAddress(newOwner)
                .endCell(),
        });
    }
}
