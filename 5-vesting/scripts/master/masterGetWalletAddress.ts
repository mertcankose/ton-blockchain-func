import { Address, toNano, fromNano } from "@ton/core";
import { VestingMaster } from "../../wrappers/VestingMaster";
import { NetworkProvider } from "@ton/blueprint";

const MASTER_CONTRACT_ADDRESS = "EQA6j1bC_3rs8NZ8s4bBeHYhuJNqJwqnlmUtreIEfszsd0kB";
const JETTON_MASTER_ADDRESS = "kQBQCVW3qnGKeBcumkLVD6x_K2nehE6xC5VsCyJZ02wvUBJy";

const CUSTOM_PARAMS = {
  START_DELAY: 60, // 1 minute
  TOTAL_DURATION: 3600, // 1 hour
  UNLOCK_PERIOD: 360, // 6 minutes
  CLIFF_DURATION: 0, // 0
};

export async function run(provider: NetworkProvider) {
  try {
    console.log("Getting Vesting Wallet Address...");
    const masterAddress = Address.parse(MASTER_CONTRACT_ADDRESS);
    const vestingMaster = provider.open(
      VestingMaster.createFromAddress(masterAddress)
    );

    const jettonMaster = Address.parse(JETTON_MASTER_ADDRESS);

    const now = Math.floor(Date.now() / 1000);
    const vestingTotalAmount = toNano("100");
    const startTime = now + CUSTOM_PARAMS.START_DELAY;
    const totalDuration = CUSTOM_PARAMS.TOTAL_DURATION;
    const unlockPeriod = CUSTOM_PARAMS.UNLOCK_PERIOD;
    const cliffDuration = CUSTOM_PARAMS.CLIFF_DURATION;
    const isAutoClaim = 1; // 0 = no auto claim, 1 = auto claim
    const cancelContractPermission = 2; // 1 = only_recipient, 2 = only_owner, 3 = both, 4 = neither
    const changeRecipientPermission = 2; // 1 = only_recipient, 2 = only_owner, 3 = both, 4 = neither

    const ownerAddress = provider.sender().address!;
    const recipientAddress = provider.sender().address!;

    const walletAddress = await vestingMaster.getWalletAddress(
      ownerAddress,
      recipientAddress,
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

    console.log("Wallet Address:", walletAddress.toString());
  } catch (error) {
    console.error("Error:", error);
  }
}