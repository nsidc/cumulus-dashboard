'use strict';

import { createReducer } from '@reduxjs/toolkit';
import { deconstructCollectionId } from '../utils/format';
import assignDate from './utils/assign-date';
import {
  createClearItemReducer,
  createErrorReducer,
  createInflightReducer,
  createSuccessReducer
} from './utils/reducer-creators';
import {
  CLEAR_COLLECTIONS_FILTER,
  CLEAR_COLLECTIONS_SEARCH,
  COLLECTION_APPLYWORKFLOW_ERROR,
  COLLECTION_APPLYWORKFLOW_INFLIGHT,
  COLLECTION_APPLYWORKFLOW,
  COLLECTION_DELETE_ERROR,
  COLLECTION_DELETE_INFLIGHT,
  COLLECTION_DELETE,
  COLLECTION_ERROR,
  COLLECTION_INFLIGHT,
  COLLECTION,
  COLLECTIONS_ERROR,
  COLLECTIONS_INFLIGHT,
  COLLECTIONS,
  FILTER_COLLECTIONS,
  NEW_COLLECTION_ERROR,
  NEW_COLLECTION_INFLIGHT,
  NEW_COLLECTION,
  SEARCH_COLLECTIONS,
  UPDATE_COLLECTION_CLEAR,
  UPDATE_COLLECTION_ERROR,
  UPDATE_COLLECTION_INFLIGHT,
  UPDATE_COLLECTION,
} from '../actions/types';

export const initialState = {
  list: {
    data: [],
    meta: {},
    params: {},
  },
  created: {},
  deleted: {},
  executed: {},
  map: {},
  updated: {},
};

export default createReducer(initialState, {
  [COLLECTION]: (state, action) => {
    const { id, data } = action;
    const { name } = deconstructCollectionId(id);
    const collection = data.results.find((element) => element.name === name);

    state.map[id] = {
      inflight: false,
      data: assignDate(collection),
    };
    delete state.deleted[id];
  },
  [COLLECTION_INFLIGHT]: (state, action) => {
    state.map[action.id] = { inflight: true };
  },
  [COLLECTION_ERROR]: (state, action) => {
    const { id, error } = action;
    state.map[id] = {
      inflight: false,
      error,
    };
  },
  [COLLECTION_APPLYWORKFLOW]: (state, action) => {
    state.executed[action.id] = {
      status: 'success',
      error: null,
    };
  },
  [COLLECTION_APPLYWORKFLOW_INFLIGHT]: createInflightReducer('executed'),
  [COLLECTION_APPLYWORKFLOW_ERROR]: createErrorReducer('executed'),
  [COLLECTIONS]: (state, action) => {
    state.list.data = action.data.results;
    state.list.meta = assignDate(action.data.meta);
    state.list.inflight = false;
    state.list.error = false;
  },
  [COLLECTIONS_INFLIGHT]: (state) => {
    state.list.inflight = true;
  },
  [COLLECTIONS_ERROR]: (state, action) => {
    state.list.inflight = false;
    state.list.error = action.error;
  },
  [NEW_COLLECTION]: createSuccessReducer('created'),
  [NEW_COLLECTION_INFLIGHT]: createInflightReducer('created'),
  [NEW_COLLECTION_ERROR]: createErrorReducer('created'),
  [UPDATE_COLLECTION]: (state, action) => {
    const { id, data } = action;
    state.map[id] = { data };
    state.updated[id] = { status: 'success' };
  },
  [UPDATE_COLLECTION_INFLIGHT]: createInflightReducer('updated'),
  [UPDATE_COLLECTION_ERROR]: createErrorReducer('updated'),
  [UPDATE_COLLECTION_CLEAR]: createClearItemReducer('updated'),
  [COLLECTION_DELETE]: (state, action) => {
    state.deleted[action.id] = {
      status: 'success',
      error: null,
    };
  },
  [COLLECTION_DELETE_INFLIGHT]: createInflightReducer('deleted'),
  [COLLECTION_DELETE_ERROR]: createErrorReducer('deleted'),
  [SEARCH_COLLECTIONS]: (state, action) => {
    state.list.params.prefix = action.prefix;
  },
  [CLEAR_COLLECTIONS_SEARCH]: (state) => {
    state.list.params.prefix = null;
  },
  [FILTER_COLLECTIONS]: (state, action) => {
    const { key, value } = action.param;
    state.list.params[key] = value;
  },
  [CLEAR_COLLECTIONS_FILTER]: (state, action) => {
    state.list.params[action.paramKey] = null;
  },
});
