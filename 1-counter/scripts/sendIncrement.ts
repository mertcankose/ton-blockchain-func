import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, Address, toNano, WalletContractV5R1 } from "@ton/ton";
import { TestContract } from "../wrappers/TestContract";
import * as dotenv from 'dotenv';

export async function run() {
  // Load environment variables
  dotenv.config();
  
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  // Get mnemonic from environment variables
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    throw new Error("MNEMONIC not found in environment variables");
  }

  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  
  // Add this line to see your wallet address
  console.log("Wallet address:", wallet.address.toString());
  
  /*
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("wallet is not deployed");
  }
  */

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  // open Counter instance by address
  const counterAddress = Address.parse("EQDOz4DsjrCmR4tE12LSVX44jeCXnytQ6SL4cDb-jS-xslch");
  const counter = new TestContract(counterAddress);
  const counterContract = client.open(counter);

  // send the increment transaction
  await counterContract.sendIncreaseValue(walletSender, {
    value: toNano('0.002'),
    increaseBy: 1
  });

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("transaction confirmed!");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
