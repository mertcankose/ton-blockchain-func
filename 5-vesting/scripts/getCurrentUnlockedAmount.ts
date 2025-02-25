import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBNGE5xY-XvSbUDcXIxWdTmMnTqyJUd5p2yeZdxzyqGnI2e");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const currentUnlockedAmount = await vestingContract.getCurrentUnlockedAmount();
    console.log("Current Unlocked Amount:", currentUnlockedAmount);

    return {
      currentUnlockedAmount: currentUnlockedAmount
    };

  } catch (error) {
    console.error("Error fetching current unlocked amount:", error);
    throw error;
  }
}