import { address, Address, toNano } from "@ton/ton";
import { Vesting } from "../wrappers/Vesting";
import { NetworkProvider } from '@ton/blueprint';
import { CONTRACT_ADDRESS, JETTON_CONTRACT_WALLET_ADDRESS } from "../key";

export async function run(provider: NetworkProvider) {
  const vestingContractAddress = Address.parse(CONTRACT_ADDRESS);
  
  const vestingContract = provider.open(Vesting.createFromAddress(vestingContractAddress));

  try {
    const sendJettons = await vestingContract.sendJettons(
        provider.sender(),
        {
            toAddress: provider.sender().address!,
            jettonAmount: toNano('10'), // 10 JETTON
            forwardTonAmount: toNano('0.01'),
            jettonWalletAddress: Address.parse(JETTON_CONTRACT_WALLET_ADDRESS)
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