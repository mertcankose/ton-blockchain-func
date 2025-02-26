import { address, Address, toNano } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse("EQBNGE5xY-XvSbUDcXIxWdTmMnTqyJUd5p2yeZdxzyqGnI2e");
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const sendJettons = await vestingContract.sendJettons(
        provider.sender(),
        {
            toAddress: provider.sender().address!,
            jettonAmount: toNano('10000000000'), // 10 JETTON
            forwardTonAmount: toNano('0.01'),
        }
    );
    console.log("Send Jettons:", sendJettons);

    return {
      sendJettons: sendJettons
    };

  } catch (error) {
    console.error("Error sending jettons:", error);
    throw error;
  }
}