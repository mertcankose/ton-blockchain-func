import { Address, toNano, fromNano } from "@ton/core";
import { VestingMaster } from "../wrappers/VestingMaster";
import { NetworkProvider } from "@ton/blueprint";

const MASTER_CONTRACT_ADDRESS = "EQBV7BsIY-U4ywfkn7jLSbi_UIjkGR6UZQJY38T0N4U-GKB2";
const JETTON_MASTER_ADDRESS = "kQBQCVW3qnGKeBcumkLVD6x_K2nehE6xC5VsCyJZ02wvUBJy";

const CUSTOM_PARAMS = {
  START_DELAY: 60, // 1 minute
  TOTAL_DURATION: 3600, // 1 hour
  UNLOCK_PERIOD: 360, // 6 minutes
  CLIFF_DURATION: 0, // 0
};

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  return days > 0 ? `${days} days` : `${seconds} seconds`;
}

export async function run(provider: NetworkProvider) {
  try {
    console.log("Creating new Vesting Wallet with custom parameters...");

    // VestingMaster kontratını aç
    const masterAddress = Address.parse(MASTER_CONTRACT_ADDRESS);
    const vestingMaster = provider.open(
      VestingMaster.createFromAddress(masterAddress)
    );

    const jettonMaster = Address.parse(JETTON_MASTER_ADDRESS);

    const royaltyFee = await vestingMaster.getRoyaltyFee();

    console.log("Royalty fee:", fromNano(royaltyFee), "TON");

    const now = Math.floor(Date.now() / 1000);
    const vestingTotalAmount = toNano("100");
    const startTime = now + CUSTOM_PARAMS.START_DELAY;
    const totalDuration = CUSTOM_PARAMS.TOTAL_DURATION;
    const unlockPeriod = CUSTOM_PARAMS.UNLOCK_PERIOD;
    const cliffDuration = CUSTOM_PARAMS.CLIFF_DURATION;
    const isAutoClaim = 1; // 0 = no auto claim, 1 = auto claim
    const cancelContractPermission = 2; // 1 = only_recipient, 2 = only_owner, 3 = both, 4 = neither
    const changeRecipientPermission = 2; // 1 = only_recipient, 2 = only_owner, 3 = both, 4 = neither

    const walletAddress = await vestingMaster.getWalletAddress(
      provider.sender().address!,
      provider.sender().address!, // Add recipient parameter (same as owner in this case)
      jettonMaster,
      vestingTotalAmount,
      startTime,
      totalDuration,
      unlockPeriod,
      cliffDuration,
      isAutoClaim,
      cancelContractPermission,
      changeRecipientPermission
    );

    console.log(
      "\nVesting Wallet will be created with these CUSTOM parameters:"
    );
    console.log("- Owner:", provider.sender().address!.toString());
    console.log("- Recipient:", provider.sender().address!.toString()); // Added recipient
    console.log("- Jetton Master:", jettonMaster.toString());
    console.log("- Vesting Total Amount:", fromNano(vestingTotalAmount), "tokens");
    console.log("- Start Time:", formatDate(startTime));
    console.log("- Total Duration:", formatDuration(totalDuration));
    console.log("- Unlock Period:", formatDuration(unlockPeriod));
    console.log("- Cliff Duration:", formatDuration(cliffDuration));
    console.log("- Wallet Address:", walletAddress.toString());
    console.log("- Auto Claim:", isAutoClaim);
    console.log("- Cancel Contract Permission:", cancelContractPermission);
    console.log("- Change Recipient Permission:", changeRecipientPermission);

    console.log(
      `\nThis operation will cost ${fromNano(royaltyFee)} TON as royalty fee.`
    );
    console.log("Sending transaction...");
    
    const result = await vestingMaster.sendCreateVestingWallet(
      provider.sender(),
      {
        value: royaltyFee + toNano("0.1"), // Royalty + gas
        queryId: 1n,
        owner: provider.sender().address!,
        recipient: provider.sender().address!, // Make sure this is set correctly
        jettonMaster: jettonMaster,
        vestingTotalAmount: vestingTotalAmount,
        startTime: startTime,
        totalDuration: totalDuration,
        unlockPeriod: unlockPeriod,
        cliffDuration: cliffDuration,
        isAutoClaim: isAutoClaim,
        cancelContractPermission: cancelContractPermission,
        changeRecipientPermission: changeRecipientPermission,
        forwardRemainingBalance: toNano("0.1"), // Forward remaining balance to the vesting wallet
      }
    );

    console.log("Transaction sent successfully!");
    console.log("Vesting Wallet address:", walletAddress.toString());
    console.log("\nNext steps:");
    console.log("1. Send jettons to this vesting wallet");
    console.log("2. Check wallet status with:");
    console.log(
      `   npx blueprint run wallet-info (after updating WALLET_ADDRESS to your new address)`
    );

    return {
      success: true,
      address: walletAddress.toString(),
    };
    
    
    return {
      success: true,
      address: walletAddress.toString(),
    };
  } catch (error) {
    console.error("Error creating vesting wallet:", error);
    throw error;
  }
}