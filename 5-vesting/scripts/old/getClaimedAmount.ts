import { Address } from "@ton/ton";
import { Vesting } from "../../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const claimedAmount = await vestingContract.getClaimedAmount();
    console.log("Claimed Amount:", claimedAmount);

    return {
      claimedAmount: claimedAmount
    };

  } catch (error) {
    console.error("Error fetching claimed amount:", error);
    throw error;
  }
}