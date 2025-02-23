import {  toNano, Address, beginCell } from "@ton/ton";
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

  const wallet = provider.sender();

  // send 0.05 TON to EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e
  await wallet.send({
    to: Address.parse("EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e"),
    value: toNano('0.05'),
    body: beginCell().storeInt(1, 32).endCell(),
    bounce: false // transfer her durumda gerçekleştirilecek. geri dönüş olmayacak.
  });
}

