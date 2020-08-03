'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { get } from 'object-path';
import { seconds, fromNow, bool, nullValue } from '../format';
import { deletePdr } from '../../actions';
import { strings } from '../../components/locale';
import { getPersistentQueryParams } from '../url-helper';

export const tableColumns = [
  {
    Header: 'Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'timestamp'
  },
  {
    Header: 'Name',
    accessor: 'pdrName',
    Cell: ({ cell: { value } }) => <Link to={location => ({ pathname: `/pdrs/pdr/${value}`, search: getPersistentQueryParams(location) })}>{value}</Link> // eslint-disable-line react/prop-types
  },
  {
    Header: 'Status',
    accessor: 'status'
  },
  {
    Header: 'Duration',
    accessor: row => seconds(row.duration),
    id: 'duration'
  },
  {
    Header: strings.granules,
    accessor: row => get(row, ['stats', 'total'], 0),
    id: 'granules'
  },
  {
    Header: 'Processing',
    accessor: row => get(row, ['stats', 'processing'], 0),
    id: 'processing'
  },
  {
    Header: 'Failed',
    accessor: row => get(row, ['stats', 'failed'], 0),
    id: 'failed'
  },
  {
    Header: 'Completed',
    accessor: row => get(row, ['stats', 'completed'], 0),
    id: 'completed'
  }
];

export const errorTableColumns = [
  {
    Header: 'Updated',
    accessor: row => fromNow(row.timestamp),
    id: 'updated'
  },
  {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ cell: { value } }) => <Link to={location => ({ pathname: `/pdrs/pdr/${value}`, search: getPersistentQueryParams(location) })}>{value}</Link> // eslint-disable-line react/prop-types
  },
  {
    Header: 'Error',
    accessor: row => get(row, 'error.Cause', nullValue),
    id: 'error'
  },
  {
    Header: 'PAN Sent',
    accessor: row => bool(row.PANSent),
    id: 'panSent'
  },
  {
    Header: 'PAN Message',
    accessor: 'PANmessage'
  }
];

const confirmDelete = (d) => `Delete ${d} PDR(s)?`;
export const bulkActions = function (pdrs) {
  return [{
    text: 'Delete',
    action: deletePdr,
    state: pdrs.deleted,
    confirm: confirmDelete
  }];
};
