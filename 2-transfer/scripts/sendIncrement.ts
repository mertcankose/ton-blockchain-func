import { Address } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, incrementValue: number = 1) {
  const transferContractAddress = Address.parse("EQDH9xFK9PEWo9oAewycehyUpOZkVKVPgo3agWJ0kb5_e28T");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  try {
    // Increment işlemini gönder (0.01 TON fee ile)
    await transferContract.sendIncrement(
      provider.sender(), 
      2
    );

    console.log("Waiting for transaction to confirm...");
    await provider.waitForDeploy(transferContract.address);
    console.log("Transaction confirmed!");

    return {
      success: true,
      incrementAmount: incrementValue
    };

  } catch (error) {
    console.error("Error during increment:", error);
    throw error;
  }
}