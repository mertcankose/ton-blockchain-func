import { Address, toNano, fromNano } from '@ton/core';
import { VestingMaster } from '../../wrappers/VestingMaster';
import { NetworkProvider } from '@ton/blueprint';

const MASTER_CONTRACT_ADDRESS = "EQA6j1bC_3rs8NZ8s4bBeHYhuJNqJwqnlmUtreIEfszsd0kB";
const WITHDRAW_AMOUNT = "";

export async function run(provider: NetworkProvider) {
  try {
    console.log('Withdrawing royalty fees from Vesting Master contract...');
    
    const masterAddress = Address.parse(MASTER_CONTRACT_ADDRESS);
    const vestingMaster = provider.open(VestingMaster.createFromAddress(masterAddress));
    
    // Kontrat sahibi kontrolü
    const owner = await vestingMaster.getOwner();
    if (!owner.equals(provider.sender().address!)) {
      throw new Error('Only the owner can withdraw royalty fees');
    }
    
    const stats = await vestingMaster.getVestingStats();
    console.log('Total wallets created:', stats.totalWalletsCreated);
    console.log('Total royalty collected:', fromNano(stats.totalRoyaltyCollected), 'TON');
    
    let amount;
    if (typeof WITHDRAW_AMOUNT === 'string' && WITHDRAW_AMOUNT.trim() !== '') {
      amount = toNano(WITHDRAW_AMOUNT);
      console.log(`Withdrawing ${WITHDRAW_AMOUNT} TON...`);
    } else {
      amount = stats.totalRoyaltyCollected;
      console.log(`Withdrawing all collected royalty: ${fromNano(amount)} TON...`);
    }
    
    if (amount <= 0n) {
      console.log('No funds to withdraw.');
      return { success: false, reason: 'No funds' };
    }
    
    // Para çek
    const result = await vestingMaster.sendWithdrawTons(
      provider.sender(),
      amount
    );
    
    console.log('Withdrawal transaction sent successfully!');
    console.log('Amount withdrawn:', fromNano(amount), 'TON');
    console.log('Recipient:', owner.toString());
    
    return {
      success: true,
      amount: fromNano(amount)
    };
  } catch (error) {
    console.error('Error withdrawing royalty:', error);
    throw error;
  }
}