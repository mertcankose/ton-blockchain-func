// scripts/update-wallet-code.ts
import { Address } from '@ton/core';
import { VestingMaster } from '../wrappers/VestingMaster';
import { compile, NetworkProvider } from '@ton/blueprint';

// Master kontrat adresi
const MASTER_CONTRACT_ADDRESS = "EQBN0iwDeFnGfaaFlt_A66ppcZDQzwmxJS5Ft5kwUQSbHdsp"; // ⚠️ Buraya gerçek master kontrat adresinizi yazın

// Yeni wallet kodu yolu (contracts/ içindeki dosya adı)
const NEW_WALLET_CODE_PATH = "VestingWallet"; // ⚠️ Yeni wallet kodu için contracts/ içindeki dosya adı

export async function run(provider: NetworkProvider) {
  try {
    console.log('Updating Vesting Wallet code in Master contract...');
    
    // VestingMaster kontratını aç
    const masterAddress = Address.parse(MASTER_CONTRACT_ADDRESS);
    const vestingMaster = provider.open(VestingMaster.createFromAddress(masterAddress));
    
    // Kontrat sahibi kontrolü
    const owner = await vestingMaster.getOwner();
    if (!owner.equals(provider.sender().address!)) {
      throw new Error('Only the owner can update the wallet code');
    }
    
    // Yeni kodu derle
    console.log(`Compiling new wallet code from ${NEW_WALLET_CODE_PATH}...`);
    const newCode = await compile(NEW_WALLET_CODE_PATH);
    
    // Kodu güncelle
    console.log('Sending update wallet code transaction...');
    const result = await vestingMaster.sendUpdateWalletCode(
      provider.sender(),
      newCode
    );
    
    console.log('Wallet code update transaction sent successfully!');
    // @ts-ignore
    console.log('Transaction ID:', result.transactions[0].id);
    console.log('\nAll wallets created from now on will use the new code.');
    console.log('Note: This does not affect existing vesting wallets.');
    
    return {
      success: true,
      // @ts-ignore
      txid: result.transactions[0].id
    };
  } catch (error) {
    console.error('Error updating wallet code:', error);
    throw error;
  }
}