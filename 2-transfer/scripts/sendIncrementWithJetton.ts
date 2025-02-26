import { Address, beginCell, toNano, TonClient } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';
import { API_KEY } from "../keys";

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse("EQDH9xFK9PEWo9oAewycehyUpOZkVKVPgo3agWJ0kb5_e28T");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  const jettonMasterAddress = Address.parse("EQCsLX9gqd0p7aG9C847wastVwvGzGSj-5r4nJT1AIe37pd5");
  const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: API_KEY });

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
        toNano('2'),  // 2 Jetton (decimals'e göre ayarlayın)
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