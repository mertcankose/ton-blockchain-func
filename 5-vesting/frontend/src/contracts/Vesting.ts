import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from '@ton/core';

export const VestingOpcodes = {
  send_jettons: 0x7777,
  claim_unlocked: 0x8888,
  add_whitelist: 0x1234,
};

export class Vesting implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Vesting(address);
  }

  async sendJettons(
    provider: ContractProvider,
    via: Sender,
    opts: {
      toAddress: Address;
      jettonAmount: bigint;
      forwardTonAmount: bigint;
      jettonWalletAddress: Address;
      queryId?: bigint;
    }
  ) {
    const queryId =
      opts.queryId ?? BigInt(Math.floor(Math.random() * 10000000000));

    const value = opts.forwardTonAmount + toNano('0.05'); // 0.05 TON for gas

    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VestingOpcodes.send_jettons, 32)
        .storeUint(queryId, 64)
        .storeAddress(opts.toAddress)
        .storeCoins(opts.jettonAmount)
        .storeCoins(opts.forwardTonAmount)
        .storeAddress(opts.jettonWalletAddress)
        .endCell(),
    });
  }

  async claimUnlocked(
    provider: ContractProvider,
    via: Sender,
    opts: {
      jettonWalletAddress: Address;
    }
  ) {
    const queryId = BigInt(Math.floor(Math.random() * 10000000000));
    const value = toNano('0.05');

    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VestingOpcodes.claim_unlocked, 32)
        .storeUint(queryId, 64)
        .storeAddress(opts.jettonWalletAddress)
        .endCell(),
    });
  }

  async addWhitelist(
    provider: ContractProvider,
    via: Sender,
    address: Address
  ) {
    const queryId = BigInt(Math.floor(Math.random() * 10000000000));
    await provider.internal(via, {
      value: toNano('0.05'), // Add proper gas amount
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VestingOpcodes.add_whitelist, 32)
        .storeUint(queryId, 64)
        .storeAddress(address)
        .endCell(),
    });
  }

  async getVestingData(provider: ContractProvider) {
    try {
      const result = await provider.get('get_vesting_data', []);
      
      return {
        vestingTotalAmount: result.stack.readBigNumber(),
        vestingStartTime: result.stack.readNumber(),
        vestingTotalDuration: result.stack.readNumber(),
        unlockPeriod: result.stack.readNumber(),
        cliffDuration: result.stack.readNumber(),
        vestingSenderAddress: result.stack.readAddress(),
        ownerAddress: result.stack.readAddress(),
        seqno: result.stack.readNumber(),
        jettonMasterAddress: result.stack.readAddress(),
        whitelist: result.stack.readCell(),
        claimedAmount: result.stack.readBigNumber(),
      };
    } catch (error) {
      console.error('Error in getVestingData:', error);
      throw error;
    }
  }

  async getCurrentLockedAmount(provider: ContractProvider) {
    const result = await provider.get('get_current_locked_amount', []);
    return result.stack.readBigNumber();
  }

  async getCurrentUnlockedAmount(provider: ContractProvider) {
    const result = await provider.get('get_current_unlocked_amount', []);
    return result.stack.readBigNumber();
  }

  async getClaimedAmount(provider: ContractProvider) {
    const result = await provider.get('get_claimed_amount', []);
    return result.stack.readBigNumber();
  }

  async getClaimableAmount(provider: ContractProvider) {
    const result = await provider.get('get_claimable_amount', []);
    return result.stack.readBigNumber();
  }

  async getIsWhitelisted(provider: ContractProvider, address: Address) {
    const result = await provider.get('get_is_whitelisted', [
      { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
    ]);
    return result.stack.readNumber();
  }
} 