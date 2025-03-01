// scripts/add-to-whitelist.ts
import { Address } from '@ton/core';
import { VestingWallet } from '../wrappers/VestingWallet';
import { NetworkProvider } from '@ton/blueprint';

// Vesting wallet adresi
const WALLET_ADDRESS = "EQCghJk4W6w72SJinDbNi1_kQxCUUc9RjBhsQFA2SHb6Z4z5"; // ⚠️ Buraya whitelist eklemek istediğiniz vesting wallet adresini yazın

// Whitelist'e eklemek istediğiniz adres
const ADDRESS_TO_ADD = "0QARfBT9PMJ_TjX8bUqFvI-ZMqixM7kY68_-7tmVm-khfOyj"; // ⚠️ Buraya whitelist'e eklemek istediğiniz adresi yazın

export async function run(provider: NetworkProvider) {
  try {
    console.log(`Adding ${ADDRESS_TO_ADD} to whitelist of wallet ${WALLET_ADDRESS}...`);
    
    // VestingWallet kontratını aç
    const walletAddress = Address.parse(WALLET_ADDRESS);
    const vestingWallet = provider.open(VestingWallet.createFromAddress(walletAddress));
    
    // Whitelist'e eklenecek adresi parse et
    const addressToAdd = Address.parse(ADDRESS_TO_ADD);
    
    // Mevcut durumu kontrol et
    const isAlreadyWhitelisted = await vestingWallet.getIsWhitelisted(addressToAdd);
    
    if (isAlreadyWhitelisted) {
      console.log('Address is already in the whitelist.');
      return { success: false, reason: 'Already whitelisted' };
    }
    
    // Kontrat sahibi kontrolü yap
    const owner = await vestingWallet.getOwner();
    if (!owner.equals(provider.sender().address!)) {
      console.log('Only the owner can add addresses to the whitelist.');
      return { success: false, reason: 'Not owner' };
    }
    
    // Whitelist'e ekle
    const result = await vestingWallet.addWhitelist(
        provider.provider(walletAddress),
        provider.sender(),
        addressToAdd
    );
    
    console.log('Address added to whitelist successfully!');
    // @ts-ignore
    console.log('Transaction ID:', result.transactions[0].id);
    
    return {
      success: true,
      wallet: walletAddress.toString(),
      address: addressToAdd.toString(),
      // @ts-ignore
      txid: result.transactions[0].id
    };
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    throw error;
  }
}