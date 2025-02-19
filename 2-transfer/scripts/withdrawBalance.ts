import { Address, toNano } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse("EQCwQzBoOPf88C6TdZx_cZVuxotGqwHKPagXljaF7KAWwztu");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
    // Kontrat verilerini kontrol et
    const contractData = await transferContract.getContractData();
    console.log("Current contract owner:", contractData.owner.toString());

    // Withdraw işlemini gönder
    await transferContract.sendWithdraw(provider.sender());

    // İşlemin onaylanmasını bekle
    console.log("Waiting for withdraw transaction to confirm...");
    await provider.waitForDeploy(transferContract.address);
    console.log("Withdraw transaction confirmed!");

    return {
      success: true,
      owner: contractData.owner.toString()
    };

  } catch (error) {
    console.error("Error during withdraw:", error);
    throw error;
  }
}