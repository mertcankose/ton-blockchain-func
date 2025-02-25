import { Address } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBB3VbBhppMC-nXlQ6Mm1Kj0RGlP8Sce0AyGfHdLR5Jaany");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const seqno = await vestingContract.getSeqno();
    console.log("Seqno:", seqno);

    return {
      seqno: seqno
    };

  } catch (error) {
    console.error("Error fetching seqno:", error);
    throw error;
  }
}