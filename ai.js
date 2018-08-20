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
