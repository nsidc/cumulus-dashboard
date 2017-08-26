'use strict';
import React from 'react';
import moment from 'moment';
import numeral from 'numeral';
import { Link } from 'react-router';

export const nullValue = '--';

export const truthy = (value) => value || nullValue;

export const fullDate = function (datestring) {
  if (!datestring) { return nullValue; }
  return moment(datestring).format('kk:mm:ss MM/DD/YY');
};

export const bigTally = function (numberstring) {
  if ((!numberstring && numberstring !== 0) || numberstring === nullValue || isNaN(numberstring)) { return nullValue; }
  numberstring = +numberstring;
  if (numberstring >= 1000) {
    return numeral(numberstring / 1000).format('0,0') + 'K';
  } else {
    return numeral(numberstring / 1000000).format('0,0') + 'M';
  }
};

export const tally = function (numberstring) {
  if ((!numberstring && numberstring !== 0) || numberstring === nullValue || isNaN(numberstring)) { return nullValue; }
  numberstring = +numberstring;
  if (numberstring < 1000) {
    return numberstring;
  } else if (numberstring < 100000) {
    return numeral(numberstring).format('0,0');
  } else {
    return bigTally(numberstring);
  }
};

export const seconds = function (numberstring) {
  if (numberstring === null || isNaN(numberstring)) { return nullValue; }
  return +numberstring.toFixed(2) + 's';
};

export const fromNow = function (numberstring) {
  if (numberstring === null || isNaN(numberstring)) { return nullValue; }
  return moment(numberstring).fromNow();
};

export const lastUpdated = function (datestring) {
  let day, time;
  if (datestring) {
    const date = moment(datestring);
    day = date.format('MMM. D, YYYY');
    time = date.format('h:mm a');
  }
  return (
    <dl className="metadata__updated">
      <dt>Last Updated:</dt>
      <dd>{day}</dd>
      { time ? <dd className='metadata__updated__time'>{time}</dd> : null }
    </dl>
  );
};

export const collectionSearchResult = function (collection) {
  const { collectionName } = collection;
  return (
    <li key={collectionName}>
      <Link to={`collections/collection/${collectionName}`}>{collectionName}</Link>
    </li>
  );
};

export const granuleSearchResult = function (granule) {
  const { granuleId } = granule;
  return (
    <li key={granuleId}>
      <Link to={`granules/granule/${granuleId}/overview`}>{granuleId}</Link>
    </li>
  );
};

export const pdrSearchResult = function (pdr) {
  const { pdrName } = pdr;
  return (
    <li key={pdrName}>
      <Link to={`pdrs/pdr/${pdrName}`}>{pdrName}</Link>
    </li>
  );
};

export const dropdownOption = function (optionElementValue, displayValue) {
  return (
    <option value={optionElementValue} key={optionElementValue}>{displayValue}</option>
  );
};

export const bool = function (bool) {
  return bool ? 'Yes' : 'No';
};

export const displayCase = function (string) {
  const split = string.split(' ');
  return split.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export const storage = function (n) {
  if (!n || isNaN(n)) return nullValue;

  n = +n;
  if (n === 0) return n;

  if (n < 1e9) return (n / 1e6).toFixed(2) + 'mb';
  else if (n < 1e12) return (n / 1e9).toFixed(2) + 'gb';
  else if (n < 1e15) return (n / 1e12).toFixed(2) + 'tb';
  else return (n / 1e15).toFixed(2) + 'pb';
};

export const link = (url) => <a href={url}>Link</a>;

export const truncate = function (string, to) {
  if (!string) return nullValue;
  to = to || 100;
  if (string.length <= to) return string;
  else return string.slice(0, to) + '...';
};

export const getCollectionId = function ({name, version}) {
  return `${name}___${version}`;
};

// "MYD13A1___006" => "MYD13A1 / 006"
export const collectionName = function (collectionId) {
  if (!collectionId) return nullValue;
  return collectionId.split('___').join(' / ');
};

export const collectionLink = function (collectionId) {
  if (!collectionId) return nullValue;
  const split = collectionId.split('___');
  if (split.length !== 2) return nullValue;
  const name = split[0];
  const version = split[1];
  return <Link to={`/collections/collection/${name}/${version}`}>{collectionName(collectionId)}</Link>;
};

export const providerLink = function (provider) {
  if (!provider) return nullValue;
  return <Link to={`/providers/provider/${provider}`}>{provider}</Link>;
};
