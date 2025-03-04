import { Address } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { VestingLogger } from '../../wrappers/VestingLogger';

const LOGGER_CONTRACT_ADDRESS = "EQDWQP-8NkhyAvsu6opiulNxuLqX3hKHWMxGyNiQEwi35-ak";

export async function run(provider: NetworkProvider) {
  try {
    console.log('Fetching Vesting Receiver Wallets...');
    
    const loggerAddress = Address.parse(LOGGER_CONTRACT_ADDRESS);
    const vestingLogger = provider.open(VestingLogger.createFromAddress(loggerAddress));
    
    const receiverWallets = await vestingLogger.getReceiverWallets(provider.sender().address!);
    
    console.log('\n===== VESTING RECEIVER WALLETS =====');
    console.log('Contract Address:', loggerAddress.toString());
    console.log('Receiver Wallets:', receiverWallets.toString());
    
    return {
      success: true,
      data: {
        address: loggerAddress.toString(),
        receiverWallets: receiverWallets.toString(),
      }
    };
  } catch (error) {
    console.error('Error fetching receiver wallets:', error);
    throw error;
  }
}