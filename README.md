``` javascript
// 引用web3
var Web3 = require("web3");
// 引用truffle-contract
var contract = require("truffle-contract");

const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
const provider = new Web3.providers.HttpProvider(endpoint);

// 合约ABI
const att_artifacts = require('../../billing/build/contracts/ATT.json');
// 通过ABI初始化合约对象
let ATT = contract(att_artifacts);
ATT.setProvider(provider);

let deployedAddress = blockchain.contracts;
let att = await ATT.at(deployedAddress.att);

const owner = blockchain.account.address;
const gas = blockchain.gas;
await att.balanceOf(owner, {from:owner,gas:gas}).then(function(r) {
  console.log("owner balance: ", r.toString());
});

let BusinessContract = contract(business_artifacts);
BusinessContract.setProvider(provider);
let businessToken = await BusinessContract.at(deployedAddress.biz);
let eventFundsFrozen = businessToken.EventFundsFrozen();

eventFundsFrozen.watch(function (err, res) {
  if (!err) {
    let args = JSON.parse(res.args.arg);
    const api = new Api(config);
    let callId = parseInt(res.args._callID);
    api.query(args).then((res) => {
      if(res != null) {
        businessToken.callFundsDeduct(aiNameTemp, callId, true, dataResult.toString(), {from: owner,gas: gas}).then(async function(r) {
          await att.balanceOf(owner, {from:owner,gas:gas}).then(function(r) {
            console.log("owner balance: ", r.toString());
          });
        });
      } else {
        businessToken.callFundsDeduct(aiNameTemp, callId, false, dataResult.toString(), {from: owner,gas: gas});
      }
    });
  }
});

```
