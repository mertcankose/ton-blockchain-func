import { Address } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse("EQCwQzBoOPf88C6TdZx_cZVuxotGqwHKPagXljaF7KAWwztu");
  
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
  
    const contractData = await transferContract.getContractData();
    const value = await transferContract.getValue();
    
    console.log("Contract Data:", {
      value: contractData.value,
      owner: contractData.owner.toString() // Owner adresini string'e çevir
    });

    console.log("Value:", value);

    return {
      value: contractData.value,
      owner: contractData.owner.toString()
    };

  } catch (error) {
    console.error("Error fetching contract data:", error);
    throw error;
  }
}