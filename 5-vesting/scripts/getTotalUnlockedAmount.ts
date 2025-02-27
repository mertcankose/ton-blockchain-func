import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const totalUnlockedAmount = await vestingContract.getTotalUnlockedAmount(1745683656);
    console.log("Total Unlocked Amount:", totalUnlockedAmount);

    return {
      totalUnlockedAmount: totalUnlockedAmount
    };

  } catch (error) {
    console.error("Error fetching total unlocked amount:", error);
    throw error;
  }
}