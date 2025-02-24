import { Address } from "@ton/ton";
import { Dict } from "../wrappers/Dict";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const dictContractAddress = Address.parse("EQAFPyga4BXOTmCf9JvUfK_o0zDgQxdLGx8mNijcVLlrDnOV");
  
  const dictContract = provider.open(Dict.createFromAddress(dictContractAddress));

  try {
    const counterValue = await dictContract.getCounterValue(Address.parse("0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj"));
    console.log("Counter Value:", counterValue);

    return {
      counterValue: counterValue
    };

  } catch (error) {
    console.error("Error fetching counter value:", error);
    throw error;
  }
}