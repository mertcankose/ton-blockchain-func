import { Address, toNano } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const transferContractAddress = Address.parse("EQDH9xFK9PEWo9oAewycehyUpOZkVKVPgo3agWJ0kb5_e28T");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
   
    const contractData = await transferContract.getContractData();
    console.log("Current contract owner:", contractData.owner.toString());

    await transferContract.sendWithdraw(provider.sender());

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