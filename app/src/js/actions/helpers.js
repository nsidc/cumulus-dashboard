'use strict';
import { get as getProperty } from 'object-path';
import _config from '../config';

export const formatError = (response = {}, body) => {
  let error = response
    ? response.statusMessage || ''
    : '';
  body = body || {};
  if (body.name) error = body.name;
  if (body.message) error += `${(error ? ': ' : '')}${body.message}`;
  return error;
};

export const getErrorMessage = (response) => {
  const { body } = response;
  const errorMessage = (body && body.errorMessage) || (body && body.message) || (body && body.detail);

  if (errorMessage) return errorMessage;
  return formatError(response, body);
};

export const addRequestAuthorization = (config, state) => {
  const token = getProperty(state, 'api.tokens.token');
  if (token) {
    config.headers = Object.assign({}, config.headers, {
      Authorization: `Bearer ${token}`
    });
  }
};

export const configureRequest = (params = {}) => {
  let config = params;

  if (!config.url && !config.path) {
    throw new Error('Must include a URL or path with request');
  }

  config.headers = config.headers || {};
  config.headers['Content-Type'] = 'application/json';

  if (config.path) {
    if (typeof config.path !== 'string') {
      throw new Error('Path must be a string');
    }
    config.url = new URL(config.path, _config.apiRoot).href;
  }

  const defaultRequestConfig = {
    json: true,
    resolveWithFullResponse: true,
    simple: false
  };
  config = Object.assign({}, defaultRequestConfig, config);

  return config;
};
