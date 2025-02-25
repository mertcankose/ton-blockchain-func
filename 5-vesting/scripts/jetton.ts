import { Address, beginCell, TonClient } from '@ton/ton';
import { NetworkProvider } from '@ton/blueprint';
import { API_KEY } from '../key';

export async function run(provider: NetworkProvider) {
    const jettonMasterAddress = 'EQCsLX9gqd0p7aG9C847wastVwvGzGSj-5r4nJT1AIe37pd5';
    const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: API_KEY });

    try {

        const userAddressCell = beginCell().storeAddress(provider.sender().address).endCell();

        const response = await client.runMethod(Address.parse(jettonMasterAddress), 'get_wallet_address', [
            { type: 'slice', cell: userAddressCell },
        ]);

        const newJettonWalletAddress = response.stack.readAddress();

        // JETTON WALLET ADDRESS
        // EQCN8p6k3QOW7WFcec0XJbApdnk9oNWrRdaQyt1oidkixeSD

        console.log('newJettonWalletAddress: ', newJettonWalletAddress);
    } catch (error) {
        console.error('Error during get_wallet_address:', error);
        throw error;
    }
}
