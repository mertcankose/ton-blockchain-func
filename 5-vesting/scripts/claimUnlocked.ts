import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBNGE5xY-XvSbUDcXIxWdTmMnTqyJUd5p2yeZdxzyqGnI2e");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    // Get current unlocked amount before claiming
    const unlockedBefore = await vestingContract.getCurrentUnlockedAmount();
    console.log("Current unlocked amount before claiming:", unlockedBefore.toString());

    // Claim unlocked tokens
    const claimResult = await vestingContract.claimUnlocked(
      provider.provider(vestingContractAddress),
      provider.sender()
    );
    console.log("Claim Unlocked Result:", claimResult);

    // Get current unlocked amount after claiming
    const unlockedAfter = await vestingContract.getCurrentUnlockedAmount();
    console.log("Current unlocked amount after claiming:", unlockedAfter.toString());

    return {
      claimResult: claimResult
    };

  } catch (error) {
    console.error("Error claiming unlocked tokens:", error);
    throw error;
  }
} 