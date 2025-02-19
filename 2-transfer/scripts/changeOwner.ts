import { Address } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, newOwnerAddress: string) {
  // Contract adresini parse et
  const transferContractAddress = Address.parse("EQCwQzBoOPf88C6TdZx_cZVuxotGqwHKPagXljaF7KAWwztu");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
    // Mevcut kontrat verilerini kontrol et
    const contractData = await transferContract.getContractData();
    console.log("Current contract owner:", contractData.owner.toString());

    // Yeni owner adresini parse et
    const newOwner = Address.parse(newOwnerAddress);

    // Change owner işlemini gönder
    await transferContract.sendChangeOwner(provider.sender(), newOwner);

    // İşlemin onaylanmasını bekle
    console.log("Waiting for ownership transfer to confirm...");
    await provider.waitForDeploy(transferContract.address);
    console.log("Ownership transfer confirmed!");

    // Güncellenmiş kontrat verilerini al
    const updatedData = await transferContract.getContractData();

    return {
      success: true,
      previousOwner: contractData.owner.toString(),
      newOwner: updatedData.owner.toString()
    };

  } catch (error) {
    console.error("Error during ownership transfer:", error);
    throw error;
  }
}