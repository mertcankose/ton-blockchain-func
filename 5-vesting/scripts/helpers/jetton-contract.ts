import { Address, beginCell, TonClient } from '@ton/ton';
import { NetworkProvider } from '@ton/blueprint';

const API_KEY = "006dccec833d6e1193c45e9c5eaa839f2170f2e780efb2af74cfb05a6261e99d";
const JETTON_MASTER_ADDRESS = "kQBQCVW3qnGKeBcumkLVD6x_K2nehE6xC5VsCyJZ02wvUBJy";
const WALLET_CONTRACT_ADDRESS = "EQDV_UbrNEBIS45vS5BJd2Ne6fJeLWwKl7Fn4xtXu5fJOEQ5";

export async function run(provider: NetworkProvider) {
    const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC', apiKey: API_KEY });

    try {
        const contractAddressCell = beginCell().storeAddress(Address.parse(WALLET_CONTRACT_ADDRESS)).endCell();

        const response = await client.runMethod(Address.parse(JETTON_MASTER_ADDRESS), 'get_wallet_address', [
            { type: 'slice', cell: contractAddressCell },
        ]);

        const newJettonWalletAddress = response.stack.readAddress();
        console.log('newJettonWalletAddress: ', newJettonWalletAddress);
    } catch (error) {
        console.error('Error during get_wallet_address:', error);
        throw error;
    }
}
