import { Address } from "@ton/ton";
import { Dict } from "../wrappers/Dict";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const dictContractAddress = Address.parse("EQAFPyga4BXOTmCf9JvUfK_o0zDgQxdLGx8mNijcVLlrDnOV");
  
  const dictContract = provider.open(Dict.createFromAddress(dictContractAddress));

  try {
    const totalAddresses = await dictContract.getTotalAddresses();
    console.log("Total Addresses:", totalAddresses);

    return {
      totalAddresses: totalAddresses
    };

  } catch (error) {
    console.error("Error fetching total addresses:", error);
    throw error;
  }
}