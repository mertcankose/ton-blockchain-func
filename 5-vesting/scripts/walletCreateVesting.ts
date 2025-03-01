// scripts/custom-create-vesting.ts
import { Address, toNano, fromNano } from "@ton/core";
import { VestingMaster } from "../wrappers/VestingMaster";
import { NetworkProvider } from "@ton/blueprint";

// Master kontrat adresi
const MASTER_CONTRACT_ADDRESS =
  "EQCGHiDZINW306D49N-C2bPfRvw7Upje6i8msb-6r9GEjlJZ"; // ⚠️ Buraya gerçek master kontrat adresinizi yazın

// Jetton master adresi
const JETTON_MASTER_ADDRESS =
  "kQBQCVW3qnGKeBcumkLVD6x_K2nehE6xC5VsCyJZ02wvUBJy"; // ⚠️ Buraya kullanmak istediğiniz jetton master adresini yazın

// Özel vesting parametreleri (tümü saniye cinsinden)
const CUSTOM_PARAMS = {
  START_DELAY: 60, // 1 minute
  TOTAL_DURATION: 3600, // 1 hour
  UNLOCK_PERIOD: 360, // 6 minutes
  CLIFF_DURATION: 0, // 0
};

// Tarih formatı
function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Süre formatı
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

    // Jetton master adresini parse et
    const jettonMaster = Address.parse(JETTON_MASTER_ADDRESS);

    // Royalty fee miktarını al
    const royaltyFee = await vestingMaster.getRoyaltyFee();

    console.log("Royalty fee:", fromNano(royaltyFee), "TON");

    // Vesting parametrelerini hazırla
    const now = Math.floor(Date.now() / 1000);
    const startTime = now + CUSTOM_PARAMS.START_DELAY;
    const totalDuration = CUSTOM_PARAMS.TOTAL_DURATION;
    const unlockPeriod = CUSTOM_PARAMS.UNLOCK_PERIOD;
    const cliffDuration = CUSTOM_PARAMS.CLIFF_DURATION;

    // Oluşturulacak wallet adresini al
    const walletAddress = await vestingMaster.getWalletAddress(
      provider.sender().address!,
      jettonMaster,
      startTime,
      totalDuration,
      unlockPeriod,
      cliffDuration
    );

    console.log(
      "\nVesting Wallet will be created with these CUSTOM parameters:"
    );
    console.log("- Owner:", provider.sender().address!.toString());
    console.log("- Jetton Master:", jettonMaster.toString());
    console.log("- Start Time:", formatDate(startTime));
    console.log("- Total Duration:", formatDuration(totalDuration));
    console.log("- Unlock Period:", formatDuration(unlockPeriod));
    console.log("- Cliff Duration:", formatDuration(cliffDuration));
    console.log("- Wallet Address:", walletAddress.toString());

    // Kullanıcı onayı - royalty fee göster
    console.log(
      `\nThis operation will cost ${fromNano(royaltyFee)} TON as royalty fee.`
    );
    console.log("Sending transaction...");

    // Create vesting wallet mesajı gönder
    const result = await vestingMaster.sendCreateVestingWallet(
      provider.sender(),
      {
        value: royaltyFee + toNano("0.05"), // Royalty + gas
        queryId: 0n,
        owner: provider.sender().address!,
        jettonMaster: jettonMaster,
        vestingTotalAmount: toNano("100000000000"), // 100  
        startTime: startTime,
        totalDuration: totalDuration,
        unlockPeriod: unlockPeriod,
        cliffDuration: cliffDuration,
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
  } catch (error) {
    console.error("Error creating vesting wallet:", error);
    throw error;
  }
}
