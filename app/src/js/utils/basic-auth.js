'use strict';

import { esUser, esPassword } from '../config';

// Build basic auth string
export const partsEncode = (user, password) => new Buffer(`${user}:${password}`).toString('base64');

export const basicAuth = (user, password) => `Basic ${partsEncode(user, password)}`;

export const buildAuthHeader = (user, password) => {
  if (!user || !password) return {};
  return {
    Authorization: basicAuth(user, password)
  };
};

export const authHeader = () => {
  return buildAuthHeader(esUser, esPassword);
};