import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const vestingData = await vestingContract.getVestingData();
    console.log("Vesting Data:", vestingData);

    return {
      vestingData: vestingData
    };

  } catch (error) {
    console.error("Error fetching vesting data:", error);
    throw error;
  }
}