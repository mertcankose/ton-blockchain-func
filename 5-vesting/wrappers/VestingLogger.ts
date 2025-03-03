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

export const VestingLoggerOpcodes = {
  register_wallet: 0x5fe9b8cd,
  update_recipient: 0x2c76b973,
  log_claim: 0xd1735400,
  log_cancel: 0xd374ab1c,
} as const;

export type VestingLoggerConfig = {
  owner_address: Address;
  whitelist: Cell;
  token_wallets: Cell;
  owner_wallets: Cell;
  receiver_wallets: Cell;
  auto_claim_wallets: Cell;
};

export function vestingLoggerConfigToCell(config: VestingLoggerConfig): Cell {
  return beginCell()
    .storeAddress(config.owner_address)
    .storeRef(config.whitelist)
    .storeRef(config.token_wallets)
    .storeRef(config.owner_wallets)
    .storeRef(config.receiver_wallets)
    .storeRef(config.auto_claim_wallets)
    .endCell();
}

export class VestingLogger implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new VestingLogger(address);
  }

  static createFromConfig(config: VestingLoggerConfig, code: Cell, workchain = 0) {
    const data = vestingLoggerConfigToCell(config);
    const init = { code, data };
    return new VestingLogger(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  // Get all wallets for a token
  async getTokenWallets(provider: ContractProvider, tokenAddress: Address) {
    const result = await provider.get("get_token_wallets", [
      { type: "slice", cell: beginCell().storeAddress(tokenAddress).endCell() },
    ]);
    return result.stack.readCell();
  }

  // Get all wallets for an owner
  async getOwnerWallets(provider: ContractProvider, ownerAddress: Address) {
    const result = await provider.get("get_owner_wallets", [
      { type: "slice", cell: beginCell().storeAddress(ownerAddress).endCell() },
    ]);
    return result.stack.readCell();
  }

  // Get all wallets for a receiver
  async getReceiverWallets(provider: ContractProvider, receiverAddress: Address) {
    const result = await provider.get("get_receiver_wallets", [
      { type: "slice", cell: beginCell().storeAddress(receiverAddress).endCell() },
    ]);
    return result.stack.readCell();
  }

  // Get all wallets with auto claim enabled
  async getAutoClaimWallets(provider: ContractProvider) {
    const result = await provider.get("get_auto_claim_wallets", []);
    return result.stack.readCell();
  }

  // Get logger owner
  async getOwner(provider: ContractProvider) {
    const result = await provider.get("get_owner", []);
    return result.stack.readAddress();
  }
}