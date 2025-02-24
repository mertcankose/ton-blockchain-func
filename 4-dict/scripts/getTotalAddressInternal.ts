import { Address, toNano } from "@ton/ton";
import { Dict } from "../wrappers/Dict";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, incrementValue: number = 1) {
  const dictContractAddress = Address.parse("EQAFPyga4BXOTmCf9JvUfK_o0zDgQxdLGx8mNijcVLlrDnOV");
  const dictContract = provider.open(Dict.createFromAddress(dictContractAddress));

  try {
    // Increment işlemini gönder (0.01 TON fee ile)
    await dictContract.getTotal(
      provider.sender(), 
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
    console.error("Error during get total:", error);
    throw error;
  }
}