import { toNano } from "@ton/core";
import { compile, NetworkProvider } from "@ton/blueprint";
import { VestingLogger } from "../../wrappers/VestingLogger";

export async function run(provider: NetworkProvider) {
  try {
    console.log("Compiling Vesting Logger code...");
    
    const vestingLogger = provider.open(
      VestingLogger.createFromConfig(
        {
          owner_address: provider.sender().address!,
        },
        await compile("VestingLogger")
      )
    );

    const DEPLOY_AMOUNT = toNano("0.1");

    console.log("Deploying Vesting Logger contract...");
    console.log("Contract address:", vestingLogger.address.toString());

    // Deploy contract
    await vestingLogger.sendDeploy(provider.sender(), DEPLOY_AMOUNT);

    // Wait for deploy transaction to complete
    console.log("Waiting for deploy transaction...");
    await provider.waitForDeploy(vestingLogger.address);
    console.log("Deploy transaction completed successfully.");

    console.log("Vesting Logger deployed successfully!");
    console.log("Contract address:", vestingLogger.address.toString());
    console.log("Owner address:", provider.sender().address!.toString());

    return {
      success: true,
      address: vestingLogger.address.toString(),
    };
  } catch (error) {
    console.error("Error deploying Vesting Master contract:", error);
    throw error;
  }
}
