import { Address, fromNano } from "@ton/core";
import { VestingWallet } from "../wrappers/VestingWallet";
import { NetworkProvider } from "@ton/blueprint";

const WALLET_ADDRESS = "EQCiSBcd0CTIaw4crOY_0jJ6VIVUYdpjVX8Wdd8M8jVw8HX7";

export async function run(provider: NetworkProvider) {
  const walletAddress = Address.parse(WALLET_ADDRESS);
  const vestingWallet = provider.open(
    VestingWallet.createFromAddress(walletAddress)
  );

  const vestingTotalAmount = await vestingWallet.getVestingTotalAmount();
  console.log("vestingTotalAmount", vestingTotalAmount);

  return {
    success: true,
    data: {
      vestingTotalAmount: vestingTotalAmount.toString(),
    },
  };
}
