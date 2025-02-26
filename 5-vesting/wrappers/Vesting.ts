import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from "@ton/core";

export const VestingOpcodes = {
  send_jettons_external: 0x7777,
  claim_unlocked_external: 0x8888,
  add_whitelist_internal: 0x1234,
  transfer_notification_internal: 0x7362d09c,
  excesses_internal: 0xd53276db,
  send_jettons: 0x7777,
} as const;

export type VestingConfig = {
  vesting_total_amount: bigint;
  vesting_start_time: number;
  vesting_total_duration: number;
  unlock_period: number;
  cliff_duration: number;
  vesting_sender_address: Address;
  owner_address: Address;
  seqno: number;
  jetton_master_address: Address;
  jetton_wallet_address: Address;
};

export function vestingConfigToCell(config: VestingConfig): Cell {
  const mainCell = beginCell()
    .storeCoins(config.vesting_total_amount)
    .storeUint(config.vesting_start_time, 32)
    .storeUint(config.vesting_total_duration, 32)
    .storeUint(config.unlock_period, 32)
    .storeUint(config.cliff_duration, 32)
    .storeAddress(config.vesting_sender_address)
    .storeAddress(config.owner_address)
    .storeUint(config.seqno, 32);

  // Store the remaining addresses in a reference cell
  const refCell = beginCell()
    .storeAddress(config.jetton_master_address)
    .storeAddress(config.jetton_wallet_address)
    .endCell();

  // Store the reference cell in the main cell
  return mainCell.storeRef(refCell).endCell();
}

export class Vesting implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Vesting(address);
  }

  static createFromConfig(config: VestingConfig, code: Cell, workchain = 0) {
    const data = vestingConfigToCell(config);
    const init = { code, data };
    return new Vesting(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendJettons(
    provider: ContractProvider, 
    via: Sender, 
    opts: {
      toAddress: Address,
      jettonAmount: bigint,
      forwardTonAmount: bigint,
      queryId?: bigint
    }
  ) {
    const queryId = opts.queryId ?? BigInt(Math.floor(Math.random() * 10000000000));
    
    // Calculate the total value to send: forward amount + gas for processing
    const value = opts.forwardTonAmount + toNano('0.01'); // 0.05 TON for gas
    
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VestingOpcodes.send_jettons, 32)
        .storeUint(queryId, 64)
        .storeAddress(opts.toAddress)
        .storeCoins(opts.jettonAmount)
        .storeCoins(opts.forwardTonAmount)
        .endCell(),
    });
  }

  async claimUnlocked(
    provider: ContractProvider,
    via: Sender,
    opts: {
      queryId?: bigint
    } = {}
  ) {
    const queryId = opts.queryId ?? BigInt(Math.floor(Math.random() * 10000000000));
    const seqno = await this.getSeqno(provider);
    const validUntil = Math.floor(Date.now() / 1000) + 600; // 10 minutes
    
    // Create the message body without signature
    const message = beginCell()
      .storeUint(seqno, 32) // seqno
      .storeUint(validUntil, 32) // valid until (10 minutes)
      .storeUint(VestingOpcodes.claim_unlocked_external, 32) // op
      .storeUint(queryId, 64) // query_id
      .endCell();
    
    // Send the external message with signature
    await provider.external(message);
  }

  async addWhitelist(provider: ContractProvider, via: Sender, address: Address) {
    const queryId = BigInt(Math.floor(Math.random() * 10000000000));
    await provider.internal(via, {
      value: toNano('0.05'), // Add proper gas amount
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VestingOpcodes.add_whitelist_internal, 32)
        .storeUint(queryId, 64)
        .storeAddress(address)
        .endCell(),
    });
  }

  async testMethod(provider: ContractProvider) {
    const result = await provider.get("test_method", []);
    return result.stack.readNumber();
  }

  async getSimpleTest(provider: ContractProvider) {
    const result = await provider.get("get_simple_test", []);
    return result.stack.readNumber();
  }

  async getLockedAmount(provider: ContractProvider, atTime: number) {
    const result = await provider.get("get_locked_amount", [
      { type: "int", value: BigInt(atTime) },
    ]);
    return result.stack.readBigNumber();
  }

  async getUnlockedAmount(provider: ContractProvider, atTime: number) {
    const result = await provider.get("get_unlocked_amount", [
      { type: "int", value: BigInt(atTime) },
    ]);
    return result.stack.readBigNumber();
  }

  async getCurrentLockedAmount(provider: ContractProvider) {
    const result = await provider.get("get_current_locked_amount", []);
    return result.stack.readBigNumber();
  }

  async getCurrentUnlockedAmount(provider: ContractProvider) {
    const result = await provider.get("get_current_unlocked_amount", []);
    return result.stack.readBigNumber();
  }

  async getSeqno(provider: ContractProvider) {
    const result = await provider.get("seqno", []);
    return result.stack.readNumber();
  }

  async getWhitelist(provider: ContractProvider) {
    const result = await provider.get("get_whitelist", []);
    console.log("result: ", result.stack);
    return result.stack.readTuple();
  }

  async getIsWhitelisted(provider: ContractProvider, address: Address) {
    const result = await provider.get("get_is_whitelisted", [
      { type: "slice", cell: beginCell().storeAddress(address).endCell() },
    ]);
    return result.stack.readNumber();
  }

  async getVestingData(provider: ContractProvider) {
    try {
      // Make sure we're using the exact method name as defined in the contract
      const result = await provider.get("get_vesting_data", []);

      console.log("result: ", result.stack);

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
        jettonWalletAddress: result.stack.readAddress(),
        //whitelist: result.stack.readCell(),
      };
    } catch (error) {
      console.error("Error in getVestingData:", error);
      throw error;
    }
  }
}
