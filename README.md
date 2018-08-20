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









/**
 * Created by zhubg on 2017/10/20.
 */

'use strict';

import { routerRedux } from 'dva/router';
import * as commonService from '../services/common_service';
import {gqlBody_builder} from '../utils/gql/gqlBody_builder';
import {CALLAI_GQL, GETAIDETAILS_GQL} from '../utils/gql/gql_template/index';

export default {
  namespace: 'ai',

  state: {
    signupFlag: 'signupFlag_null',
    aiName: '',
    AIDetails: '',
    requesting: false,
    callAIResult: '',
    callAILog: '',
    callStep: {},
  },

  reducers: {
    saveCallAIResult(state, { payload }) {
      return {
        ...state,
        callAIResult: payload,
        requesting: false,
      };
    },

    newStep(state, { payload }) {
      return {
        ...state,
        callStep: Object.assign(state.callStep, payload),
      };
    },

    newLog(state, { payload }) {
      return {
        ...state,
        callAILog: `${state.callAILog}\n\n${payload}`,
      };
    },
  },

  effects: {
    * callai({ payload }, { put, call, select }) {
      yield put({
        type: 'makeRequest',
      })

      yield put({
        type: 'newStep',
        payload: {
          blockchainStatus: 'process',
        },
      })
    },

    * nextStep({ payload }, { put, call, select }) {
      const steps = [
        'BlockChain',
        'FrozenFunds',
        'Worker',
        'DeductFunds',
        'Results',
      ]
      const statuses = [
        'blockchainStatus',
        'frozenFundsStatus',
        'workerStatus',
        'deductFundsStatus',
        'resultStatus',
      ]
      yield put({
        type: 'newLog',
        payload: JSON.stringify(payload, null, 2),
      });
      if (payload.stage === 'Results') {
        yield put({
          type: 'saveCallAIResult',
          payload: JSON.stringify(payload, null, 2),
        })
      }
      const putPayload = {}
      const idx = steps.indexOf(payload.stage)
      const current = statuses[idx]
      if (payload.err) {
        putPayload[current] = 'error'
      } else {
        const next = statuses[idx + 1]
        putPayload[current] = 'finish'
        if (next) {
          putPayload[next] = 'process'
        }
      }
      yield put({
        type: 'newStep',
        payload: putPayload,
      })
    },
  },
}



```
