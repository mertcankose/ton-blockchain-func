  import { Address } from "@ton/ton";
  import { Vesting } from "../../wrappers/Vesting";
import { NetworkProvider } from "@ton/blueprint";
import { CONTRACT_ADDRESS, JETTON_CONTRACT_WALLET_ADDRESS } from "../../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);

  const vestingContract = provider.open(
    Vesting.createFromAddress(vestingContractAddress)
  );

  try {
    const unlockedBefore = await vestingContract.getCurrentUnlockedAmount();
    console.log(
      "Current unlocked amount before claiming:",
      unlockedBefore.toString()
    );

    const claimResult = await vestingContract.claimUnlocked(
      provider.provider(vestingContractAddress),
      provider.sender(),
      {
        jettonWalletAddress: Address.parse(JETTON_CONTRACT_WALLET_ADDRESS),
      }
    );
    console.log("Claim Unlocked Result:", claimResult);

    const unlockedAfter = await vestingContract.getCurrentUnlockedAmount();
    console.log(
      "Current unlocked amount after claiming:",
      unlockedAfter.toString()
    );

    return {
      claimResult: claimResult,
    };
  } catch (error) {
    console.error("Error claiming unlocked tokens:", error);
    throw error;
  }
}
