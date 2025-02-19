import "@twa-dev/sdk";
import "./App.css";
import { WalletInfo } from "@tonconnect/ui";
import { useEffect, useState } from "react";
import { useCounterContract } from "./hooks/useCounterContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { tonConnectUI } from "./helpers/tonConnect";

const App = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  const { connected } = useTonConnect();
  const { value, address, sendIncrement } = useCounterContract();

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="pt-4">
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
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        {wallet ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 items-center justify-between">
              <div className="">
                <p className="text-sm text-gray-600">Connected Wallet</p>
                <p className="font-medium">{wallet.appName}</p>

                <p className="text-sm text-gray-500 truncate">
                  {/* @ts-ignore */}
                  {wallet.account.address.slice(0, 30) + "..."}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Wallet
          </button>
        )}

        <div className="mt-6 space-y-6">
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">Counter Address</p>
            <div className="font-mono text-sm bg-gray-50 p-2 rounded">
              {address?.slice(0, 30) + "..."}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">Counter Value</p>
            <div className="text-2xl font-bold text-gray-800">
              {value ?? "Loading..."}
            </div>
          </div>

          <button
            onClick={() => sendIncrement()}
            className="w-full py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!connected}
          >
            Increment Counter
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
