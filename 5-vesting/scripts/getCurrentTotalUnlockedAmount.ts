import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const currentTotalUnlockedAmount = await vestingContract.getCurrentTotalUnlockedAmount();
    console.log("Current Total Unlocked Amount:", currentTotalUnlockedAmount);

    return {
      currentTotalUnlockedAmount: currentTotalUnlockedAmount
    };

  } catch (error) {
    console.error("Error fetching current total unlocked amount:", error);
    throw error;
  }
}