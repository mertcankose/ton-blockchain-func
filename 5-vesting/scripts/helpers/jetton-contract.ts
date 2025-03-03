import { Address, beginCell, TonClient } from '@ton/ton';
import { NetworkProvider } from '@ton/blueprint';
import { API_KEY, CONTRACT_ADDRESS, JETTON_MASTER_ADDRESS } from '../../key';

export async function run(provider: NetworkProvider) {
    const jettonMasterAddress = JETTON_MASTER_ADDRESS;
    const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC', apiKey: API_KEY });

    try {
        const userAddressCell = beginCell().storeAddress(Address.parse("EQAgFFbyxbVkh_j3ERptIxfqiL92RdSGQJ0WNPrwodwHeaUk")).endCell();

        const response = await client.runMethod(Address.parse(jettonMasterAddress), 'get_wallet_address', [
            { type: 'slice', cell: userAddressCell },
        ]);

        const newJettonWalletAddress = response.stack.readAddress();
        console.log('newJettonWalletAddress: ', newJettonWalletAddress);
    } catch (error) {
        console.error('Error during get_wallet_address:', error);
        throw error;
    }
}
