import { Address, toNano } from "@ton/ton";
import { Dict } from "../wrappers/Dict";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, incrementValue: number = 1) {
  const dictContractAddress = Address.parse("EQAFPyga4BXOTmCf9JvUfK_o0zDgQxdLGx8mNijcVLlrDnOV");
  const dictContract = provider.open(Dict.createFromAddress(dictContractAddress));

  try {
    // Increment işlemini gönder (0.01 TON fee ile)
    await dictContract.decrement(
      provider.provider(dictContractAddress),
      provider.sender(), 
      Address.parse("0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj"),
      toNano(0.01)
    );

    console.log("Waiting for transaction to confirm...");
    await provider.waitForDeploy(dictContract.address);
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