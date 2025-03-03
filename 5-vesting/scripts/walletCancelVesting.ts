import { Address, fromNano, toNano } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

const WALLET_ADDRESS = "EQAgFFbyxbVkh_j3ERptIxfqiL92RdSGQJ0WNPrwodwHeaUk";

export async function run(provider: NetworkProvider) {
  try {
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    let jettonWalletAddress = Address.parse("EQBuor-j5UJTYxyPO7d3mHXdoJSK-8XrszCxmym3cfw2WFMu");
    
    const forwardTonAmount = toNano('0.5');
    const result = await vestingWallet.cancelVesting(
      provider.provider(walletAddress),
      provider.sender(),
      {
        forwardTonAmount,
        jettonWalletAddress
      }
    );
    
    console.log('Cancel transaction sent successfully!');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error canceling vesting:', error);
    throw error;
  }
}