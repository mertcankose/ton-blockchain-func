import { Address, beginCell, toNano, TonClient } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';
import { API_KEY } from "../keys";

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse("EQDH9xFK9PEWo9oAewycehyUpOZkVKVPgo3agWJ0kb5_e28T");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  const jettonMasterAddress = "EQCsLX9gqd0p7aG9C847wastVwvGzGSj-5r4nJT1AIe37pd5";
  const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC', apiKey: API_KEY });

  try {
    console.log('Sending increment with jetton...');

    const userAddressCell = beginCell().storeAddress(provider.sender().address).endCell();

    const response = await client.runMethod(Address.parse(jettonMasterAddress), 'get_wallet_address', [
      { type: 'slice', cell: userAddressCell },
    ]);
  
    const newJettonWalletAddress = response.stack.readAddress();
    
    // Send the jetton transfer
    await transferContract.sendIncrementWithJetton(
        provider.sender(),
        toNano('2'),
        newJettonWalletAddress
    );

    console.log("Waiting for transaction to confirm...");
    await provider.waitForDeploy(transferContract.address);

    // Get updated contract data
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