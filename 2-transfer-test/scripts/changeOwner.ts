import { Address } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../keys";

export async function run(provider: NetworkProvider, newOwnerAddress: string) {
  const transferContractAddress = Address.parse(CONTRACT_ADDRESS);
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
    const contractData = await transferContract.getContractData();
    console.log("Current contract owner:", contractData.owner.toString());

    const newOwner = Address.parse(newOwnerAddress);

    await transferContract.sendChangeOwner(provider.sender(), newOwner);

    console.log("Waiting for ownership transfer to confirm...");
    await provider.waitForDeploy(transferContract.address);
    console.log("Ownership transfer confirmed!");

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