import { Address } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse("EQCL9cdMDf_PnW0oWqpCTNnNOJkPDp0da6eI2p7ubglp8D7l");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  const senderAddress = provider.sender().address;

  try {
    // call the getter on chain
    const contractData = await transferContract.getContractData();
    console.log("Contract Value:", contractData.value);
    console.log("Contract Owner:", contractData.owner);
    
    /*
    if (senderAddress) {
      const userStats = await transferContract.getUserStats(senderAddress);
      console.log("User Transaction Count:", userStats);
    }
    */
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
