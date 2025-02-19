import { Address } from "@ton/ton";
import { TestContract } from "../wrappers/TestContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  // open Counter instance by address
  const counterAddress = Address.parse("EQBWmdMDdsWt2dlzCnkHKriljlBaa0T6ISEAjoKpyZ1OluNy"); // replace with your address
  const counter = provider.open(TestContract.createFromAddress(counterAddress));

  // call the getter on chain
  const counterValue = await counter.getCurrentValue();
  console.log("value:", counterValue.toString());
}
