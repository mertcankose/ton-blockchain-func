import { Address, fromNano } from "@ton/core";
import { VestingWallet } from "../wrappers/VestingWallet";
import { NetworkProvider } from "@ton/blueprint";

const WALLET_ADDRESS = "EQAgFFbyxbVkh_j3ERptIxfqiL92RdSGQJ0WNPrwodwHeaUk";

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
