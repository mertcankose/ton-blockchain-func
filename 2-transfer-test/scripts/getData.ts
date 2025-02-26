import { Address } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../keys";

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
    const contractData = await transferContract.getContractData();
    const value = await transferContract.getValue();
    const jettonBalance = await transferContract.getJettonBalance();

    console.log("Value:", value);
    console.log("Jetton Balance:", jettonBalance);
    console.log("Contract Data:", {
      value: contractData.value,
      owner: contractData.owner.toString(), // Owner adresini string'e çevir
      jettonBalance: contractData.jettonBalance.toString()
    });

    return {
      value: contractData.value,
      owner: contractData.owner.toString(),
      jettonBalance: contractData.jettonBalance.toString()
    };

  } catch (error) {
    console.error("Error fetching contract data:", error);
    throw error;
  }
}