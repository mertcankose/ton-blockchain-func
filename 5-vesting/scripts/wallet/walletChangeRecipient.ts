import { Address, fromNano, toNano } from '@ton/core';
import { VestingWallet } from '../../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_ADDRESS = "EQB9HKUKa9iRzn6-NtmqbYYkJgxVangaQPDpWUtR3CTBbij-";


export async function run(provider: NetworkProvider) {
  try {
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    let newRecipientAddress = Address.parse("0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj");
    
    const forwardTonAmount = toNano('0.5');
    const result = await vestingWallet.changeRecipient(
      provider.provider(walletAddress),
      provider.sender(),
      {
        newRecipientAddress: newRecipientAddress
      }
    );
    
    console.log('Change recipient transaction sent successfully!');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error canceling vesting:', error);
    throw error;
  }
}