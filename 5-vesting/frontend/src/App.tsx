import "@twa-dev/sdk";
import { WalletInfo } from "@tonconnect/ui";
import { useEffect, useState } from "react";
import { useVestingContract } from "./hooks/useVestingContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { tonConnectUI } from "./helpers/tonConnect";
import { toNano } from "@ton/core";

const App = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [jettonWalletAddress, setJettonWalletAddress] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [jettonAmount, setJettonAmount] = useState<string>("");
  const [forwardTonAmount, setForwardTonAmount] = useState<string>("0.01");
  const [whitelistAddress, setWhitelistAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("info");

  const { connected } = useTonConnect();
  const {
    vestingData,
    lockedAmount,
    unlockedAmount,
    claimedAmount,
    claimableAmount,
    loading,
    error,
    isRefreshing,
    address,
    refreshData,
    claimUnlocked,
    sendJettons,
    addWhitelist,
  } = useVestingContract();

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(setWallet);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnect = async () => {
    await tonConnectUI.openModal();
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
  };

  const handleRefresh = async () => {
    if (refreshData) {
      await refreshData();
    }
  };

  const handleClaimUnlocked = async () => {
    if (!connected || !jettonWalletAddress) return;
    try {
      await claimUnlocked(jettonWalletAddress);
      setTimeout(() => {
        if (refreshData) refreshData();
      }, 5000);
    } catch (error) {
      console.error("Error claiming unlocked tokens:", error);
    }
  };

  const handleSendJettons = async () => {
    if (
      !connected ||
      !recipientAddress ||
      !jettonWalletAddress ||
      !jettonAmount
    )
      return;
    try {
      await sendJettons(
        recipientAddress,
        toNano(jettonAmount),
        toNano(forwardTonAmount),
        jettonWalletAddress
      );
      setTimeout(() => {
        if (refreshData) refreshData();
      }, 5000);
    } catch (error) {
      console.error("Error sending jettons:", error);
    }
  };

  const handleAddWhitelist = async () => {
    if (!connected || !whitelistAddress) return;
    try {
      await addWhitelist(whitelistAddress);
      setTimeout(() => {
        if (refreshData) refreshData();
      }, 5000);
    } catch (error) {
      console.error("Error adding address to whitelist:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Get wallet address safely
  const getWalletAddress = () => {
    if (!wallet) return "";
    // @ts-ignore - The wallet.account property exists but TypeScript doesn't know about it
    return wallet.account?.address || "";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">TON Vesting</h1>

          {/* Connection Status */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Status:{" "}
              <span
                className={`font-medium ${
                  connected ? "text-green-500" : "text-red-500"
                }`}
              >
                {connected ? "Connected" : "Not Connected"}
              </span>
            </p>
          </div>

          {/* Wallet Connection */}
          {wallet ? (
            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-2 items-center justify-between">
                <div className="w-full">
                  <p className="text-sm text-gray-600">Connected Wallet</p>
                  <p className="font-medium">{wallet.appName}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {getWalletAddress().slice(0, 30) + "..."}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-6"
            >
              Connect Wallet
            </button>
          )}

          {/* Refresh Button */}
          <div className="mb-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${
                activeTab === "info"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("info")}
            >
              Info
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "claim"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("claim")}
            >
              Claim
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "send"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("send")}
            >
              Send
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "whitelist"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("whitelist")}
            >
              Whitelist
            </button>
          </div>

          {/* Content */}
          {loading && !isRefreshing ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : (
            <>
              {/* Info Tab */}
              {activeTab === "info" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Contract Address
                    </p>
                    <div className="font-mono text-sm bg-gray-50 p-2 rounded truncate">
                      {address || "N/A"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Vesting Total Amount
                    </p>
                    <div className="text-lg font-bold text-gray-800">
                      {vestingData?.vestingTotalAmount
                        ? Number(vestingData.vestingTotalAmount) / 1e9
                        : "N/A"}{" "}
                      JETTON
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Vesting Start Time
                    </p>
                    <div className="text-lg font-bold text-gray-800">
                      {vestingData?.vestingStartTime
                        ? formatDate(vestingData.vestingStartTime)
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Vesting Duration
                    </p>
                    <div className="text-lg font-bold text-gray-800">
                      {vestingData?.vestingTotalDuration
                        ? formatDuration(vestingData.vestingTotalDuration)
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unlock Period</p>
                    <div className="text-lg font-bold text-gray-800">
                      {vestingData?.unlockPeriod
                        ? formatDuration(vestingData.unlockPeriod)
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cliff Duration</p>
                    <div className="text-lg font-bold text-gray-800">
                      {vestingData?.cliffDuration
                        ? vestingData.cliffDuration
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Locked Amount</p>
                    <div className="text-lg font-bold text-gray-800">
                      {lockedAmount} JETTON
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Unlocked Amount
                    </p>
                    <div className="text-lg font-bold text-gray-800">
                      {unlockedAmount} JETTON
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Claimed Amount</p>
                    <div className="text-lg font-bold text-gray-800">
                      {claimedAmount} JETTON
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Claimable Amount
                    </p>
                    <div className="text-lg font-bold text-gray-800">
                      {claimableAmount} JETTON
                    </div>
                  </div>
                </div>
              )}

              {/* Claim Tab */}
              {activeTab === "claim" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Claimable Amount
                    </p>
                    <div className="text-lg font-bold text-gray-800">
                      {claimableAmount} JETTON
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Jetton Wallet Address
                    </label>
                    <input
                      type="text"
                      value={jettonWalletAddress}
                      onChange={(e) => setJettonWalletAddress(e.target.value)}
                      placeholder="Enter your jetton wallet address"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleClaimUnlocked}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={
                      !connected ||
                      !jettonWalletAddress ||
                      Number(claimableAmount) <= 0
                    }
                  >
                    Claim Unlocked Tokens
                  </button>
                </div>
              )}

              {/* Send Tab */}
              {activeTab === "send" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Enter recipient address"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Jetton Amount
                    </label>
                    <input
                      type="text"
                      value={jettonAmount}
                      onChange={(e) => setJettonAmount(e.target.value)}
                      placeholder="Enter amount to send"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Forward TON Amount
                    </label>
                    <input
                      type="text"
                      value={forwardTonAmount}
                      onChange={(e) => setForwardTonAmount(e.target.value)}
                      placeholder="Enter forward TON amount"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Jetton Wallet Address
                    </label>
                    <input
                      type="text"
                      value={jettonWalletAddress}
                      onChange={(e) => setJettonWalletAddress(e.target.value)}
                      placeholder="Enter your jetton wallet address"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleSendJettons}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={
                      !connected ||
                      !recipientAddress ||
                      !jettonAmount ||
                      !jettonWalletAddress
                    }
                  >
                    Send Jettons
                  </button>
                </div>
              )}

              {/* Whitelist Tab */}
              {activeTab === "whitelist" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Add Address to Whitelist
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Only the vesting sender can add addresses to the whitelist
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Address to Whitelist
                    </label>
                    <input
                      type="text"
                      value={whitelistAddress}
                      onChange={(e) => setWhitelistAddress(e.target.value)}
                      placeholder="Enter address to whitelist"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleAddWhitelist}
                    className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={!connected || !whitelistAddress}
                  >
                    Add to Whitelist
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
