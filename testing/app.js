const { Address, beginCell } = require("@ton/core")
const { TonClient, JettonMaster } = require("@ton/ton")

const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});

// Using SCALE (Scaleton) jetton master address as an example
const jettonMasterAddress = Address.parse('EQCsLX9gqd0p7aG9C847wastVwvGzGSj-5r4nJT1AIe37pd5')
// Example user address - replace with a real address if needed
const userAddress = Address.parse('UQBsQBAHy5FOWkOHrLDGDwlpEOhDerGg73Hb0RNTiJDpmiBM')

const jettonMaster = client.open(JettonMaster.create(jettonMasterAddress))
console.log(jettonMaster.getWalletAddress(userAddress))