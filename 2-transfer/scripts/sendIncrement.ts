import { Address, toNano } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  // open Counter instance by address
  const transferContractAddress = Address.parse("EQCL9cdMDf_PnW0oWqpCTNnNOJkPDp0da6eI2p7ubglp8D7l");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
    // send the increment transaction with required fee
    await transferContract.sendIncrement(provider.sender(), 1, toNano('0.01'));

    // wait until transaction is confirmed
    console.log("waiting for transaction to confirm...");
    await provider.waitForDeploy(transferContract.address);
    
    // Get updated contract data
    const contractData = await transferContract.getContractData();
    console.log("Transaction confirmed!");
    console.log("New contract value:", contractData.value);
  } catch (error) {
    console.error("Error:", error);
  }
}

