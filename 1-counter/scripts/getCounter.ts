import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address } from "@ton/ton";
import {TestContract} from "../wrappers/TestContract"; // this is the interface class we just implemented

export async function run() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  // open Counter instance by address
  const counterAddress = Address.parse("EQDOz4DsjrCmR4tE12LSVX44jeCXnytQ6SL4cDb-jS-xslch"); // replace with your address from step 8
  const counter = new TestContract(counterAddress);
  const counterContract = client.open(counter);

  // call the getter on chain
  const counterValue = await counterContract.getCurrentValue();
  console.log("value:", counterValue.toString());
}
