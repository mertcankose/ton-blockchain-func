import { Address, beginCell, toNano, TonClient } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';
import { API_KEY, CONTRACT_ADDRESS, JETTON_MASTER_ADDRESS } from "../keys";

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse(CONTRACT_ADDRESS);
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  const jettonMasterAddress = Address.parse(JETTON_MASTER_ADDRESS);
  const client = new TonClient({ endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC', apiKey: API_KEY });

  try {
    console.log('Sending increment with jetton...');

    // Kullanıcının kendi adresini alıyoruz
    const userAddress = provider.sender().address!;
    console.log('User address:', userAddress.toString());
    
    // Kullanıcının Jetton Wallet adresini buluyoruz
    const userAddressCell = beginCell().storeAddress(userAddress).endCell();
    
    const response = await client.runMethod(jettonMasterAddress, 'get_wallet_address', [
      { type: 'slice', cell: userAddressCell },
    ]);
  
    const userJettonWalletAddress = response.stack.readAddress();
    console.log('User Jetton Wallet address:', userJettonWalletAddress.toString());
    
    // Jetton transfer işlemini gönderiyoruz
    await transferContract.sendIncrementWithJetton(
        provider.sender(),
        toNano('2'),  // 2 Jetton
        userJettonWalletAddress  // Kullanıcının kendi Jetton Wallet adresi
    );

    console.log("Waiting for transaction to confirm...");
    await provider.waitForDeploy(transferContract.address);

    // Güncellenmiş kontrat verisini alıyoruz
    const contractData = await transferContract.getContractData();
    console.log("Updated contract data:", {
        value: contractData.value,
        jettonBalance: contractData.jettonBalance.toString()
    });

    console.log("Transaction confirmed!");



    return {
        success: true,
        contractData
    };

  } catch (error) {
    console.error("Error during jetton increment:", error);
    throw error;
  }
}