import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const claimableAmount = await vestingContract.getClaimableAmount();
    console.log("Claimable Amount:", claimableAmount);

    return {
      claimableAmount: claimableAmount
    };

  } catch (error) {
    console.error("Error fetching claimable amount:", error);
    throw error;
  }
}