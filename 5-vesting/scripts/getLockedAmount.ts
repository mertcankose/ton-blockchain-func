import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS } from "../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const lockedAmount = await vestingContract.getLockedAmount(1745683656);
    console.log("Locked Amount:", lockedAmount);

    return {
      lockedAmount: lockedAmount
    };

  } catch (error) {
    console.error("Error fetching locked amount:", error);
    throw error;
  }
}