import { address, Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBNGE5xY-XvSbUDcXIxWdTmMnTqyJUd5p2yeZdxzyqGnI2e");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const addWhitelist = await vestingContract.addWhitelist(provider.provider(vestingContractAddress), provider.sender(), provider.sender().address!);
    console.log("Add Whitelist:", addWhitelist);

    return {
      addWhitelist: addWhitelist
    };

  } catch (error) {
    console.error("Error adding whitelist:", error);
    throw error;
  }
}