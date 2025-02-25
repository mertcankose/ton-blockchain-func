import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBB3VbBhppMC-nXlQ6Mm1Kj0RGlP8Sce0AyGfHdLR5Jaany");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const isWhitelisted = await vestingContract.getIsWhitelisted(provider.sender().address!);
    console.log("Is Whitelisted:", isWhitelisted);

    return {
      isWhitelisted: isWhitelisted
    };

  } catch (error) {
    console.error("Error fetching whitelist:", error);
    throw error;
  }
}