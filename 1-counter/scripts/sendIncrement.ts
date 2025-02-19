
import { Address, toNano } from "@ton/ton";
import { TestContract } from "../wrappers/TestContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  // open Counter instance by address
  const counterAddress = Address.parse("EQBWmdMDdsWt2dlzCnkHKriljlBaa0T6ISEAjoKpyZ1OluNy");
  const counter = provider.open(TestContract.createFromAddress(counterAddress));

  // send the increment transaction
  await counter.sendIncreaseValue(provider.sender(), {
    value: toNano('0.002'),
    increaseBy: 1
  });

  // wait until transaction is confirmed
  console.log("waiting for transaction to confirm...");
  await provider.waitForDeploy(counter.address);
  console.log("transaction confirmed!");
}

