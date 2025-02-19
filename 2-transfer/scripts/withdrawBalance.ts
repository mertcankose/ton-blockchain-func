
import { Address, toNano } from "@ton/ton";
import { TransferContract } from "../wrappers/TransferContract";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
  // open Counter instance by address
  const transferContractAddress = Address.parse("EQCL9cdMDf_PnW0oWqpCTNnNOJkPDp0da6eI2p7ubglp8D7l");
  const transferContract = provider.open(TransferContract.createFromAddress(transferContractAddress));

  // send the increment transaction
  await transferContract.sendWithdraw(provider.sender(), toNano('0.001'));

  // wait until transaction is confirmed
  console.log("waiting for transaction to confirm...");
  await provider.waitForDeploy(transferContract.address);
  console.log("transaction confirmed!");
}

