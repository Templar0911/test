'use strict';

import contractUtil from '../../../util/contracts.js'
import config from '../../../../config'
// import sendTx from './sendTx'
// import rp from 'request-promise'

const {
  endpoint,
  account,
  cost,
  gas,
  contracts,
} = config.blockchain

const {
  web3,
  biz,
  consumer,
  att
} = contractUtil

module.exports.callAI = async (socket, msg) => {
  try {
    const callConf = {
      from: account.address,
      gas,
    }

    web3.personal.unlockAccount(account.address, account.password)

    const a = await att.balanceOf(account.address, callConf);
    await att.approve(contracts.bill, 1000000, callConf);
    const b = await att.allowance(account.address, contracts.bill, callConf);

    const aiID = msg.aiID;
    const args = JSON.stringify(msg.args)
    const tx = await consumer.callAI(aiID, args, callConf);

    socket.emit('message', {
      stage : "BlockChain",
      err:'',
      res:'',
    })

    const eventFundsFrozen = biz.EventFundsFrozen({ transactionHash: tx });

    let callID;
    eventFundsFrozen.watch((err, res) => {
      console.log('===========frozenFunds============')
      if (!err && res.transactionHash === tx) {
        callID = res.args._callID;
        socket.emit('message', {
          stage:'FrozenFunds',
          err,
          res,
        })
        eventFundsFrozen.stopWatching();
      }
    })

    let deductFundsMsg = null
    let resultMsg = null
    let workerDone = false
    let deductFundsDone = false

    let eventWorker = biz.EventWorker();
    eventWorker.watch((err, res)=>{
      console.log('============worker=============')
      if(!err && callID && res.args._callID.equals(callID)) {
        socket.emit('message', {
          stage:'Worker',
          err,
          res,
        })
        eventWorker.stopWatching();
        if (deductFundsMsg) {
          socket.emit('message', deductFundsMsg)
          deductFundsDone = true
        }
        if (resultMsg && deductFundsDone) {
          socket.emit('message', resultMsg)
          socket.disconnect()
        }
        workerDone = true
      }
    })

    let eventFundsDeduct = biz.EventFundsDeduct();
    eventFundsDeduct.watch((err, res)=>{
      console.log('===========deductFunds============')
      if (!err && callID && res.args._callID.equals(callID)) {
        const resp = {
          stage:'DeductFunds',
          err,
          res,
        }
        if (workerDone) {
          socket.emit('message', resp)
          deductFundsDone = true
        } else {
          deductFundsMsg = resp
        }
        eventFundsDeduct.stopWatching();
        if (deductFundsDone && resultMsg) {
          socket.emit('message', resultMsg)
          socket.disconnect()
        }
      }
    })

    let eventNewCallback = consumer.newCallback();
    eventNewCallback.watch((err, res)=>{
      console.log('=============result===============')
      if(!err && callID && res.args._callID.equals(callID)) {
        const resp = {
          stage:'Results',
          err,
          res,
        }
        if (deductFundsDone) {
          socket.emit('message', resp)
          socket.disconnect()
        } else {
          resultMsg = resp
        }
        eventNewCallback.stopWatching();
      }
    });
  } catch (err) {
    console.log(err);
  }
}
