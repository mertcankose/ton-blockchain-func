// scripts/wallet-info.ts
import { Address, fromNano } from "@ton/core";
import { VestingWallet } from "../wrappers/VestingWallet";
import { NetworkProvider } from "@ton/blueprint";

// Vesting wallet adresi
const WALLET_ADDRESS = "EQCLej5yn2szQqUrjh-nAqMRoZLL2piPWY1J5Jndl_2fFCvO";

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
