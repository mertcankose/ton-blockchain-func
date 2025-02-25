import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBNGE5xY-XvSbUDcXIxWdTmMnTqyJUd5p2yeZdxzyqGnI2e");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const unlockedAmount = await vestingContract.getUnlockedAmount(1745683656);
    console.log("Unlocked Amount:", unlockedAmount);

    return {
      unlockedAmount: unlockedAmount
    };

  } catch (error) {
    console.error("Error fetching unlocked amount:", error);
    throw error;
  }
}