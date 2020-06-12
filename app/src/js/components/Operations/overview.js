'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import cloneDeep from 'lodash.clonedeep';
import {
  clearOperationsFilter,
  filterOperations,
  searchOperations,
  clearOperationsSearch,
  getCount,
  getCumulusInstanceMetadata,
  interval,
  listCollections,
  listOperations,
  listWorkflows
} from '../../actions';
import { tally } from '../../utils/format';
import {
  workflowOptions,
  collectionOptions
} from '../../selectors';
import List from '../Table/Table';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import _config from '../../config';
import { tableColumns } from '../../utils/table-config/operations';
import ListFilters from '../ListActions/ListFilters';
import pageSizeOptions from '../../utils/page-size';

const { updateInterval } = _config;

const statusOptions = {
  Running: 'RUNNING',
  Succeeded: 'SUCCEEDED',
  'Task Failed': 'TASK_FAILED',
  'Runner Failed': 'RUNNER_FAILED'
};

const typeOptions = {
  'Bulk Granules': 'Bulk Granules',
  'ES Index': 'ES Index',
  'Bulk Delete': 'Bulk Delete',
  'Kinesis Replay': 'Kinesis Replay'
};

class OperationOverview extends React.Component {
  constructor (props) {
    super(props);
    this.queryMeta = this.queryMeta.bind(this);
    this.generateQuery = this.generateQuery.bind(this);
    this.searchOperations = this.searchOperations.bind(this);
  }

  componentDidMount () {
    // use a slightly slower update interval, since the dropdown fields
    // will change less frequently.
    this.cancelInterval = interval(this.queryMeta, updateInterval, true);
    this.props.dispatch(getCumulusInstanceMetadata());
  }

  componentWillUnmount () {
    if (this.cancelInterval) { this.cancelInterval(); }
  }

  generateQuery () {
    return {};
  }

  queryMeta () {
    this.props.dispatch(listCollections({
      limit: 100,
      fields: 'name,version'
    }));
    this.props.dispatch(listWorkflows());
    this.props.dispatch(getCount({
      type: 'executions',
      field: 'status'
    }));
  }

  searchOperations (list, prefix) {
    return list.filter((item) => {
      if (item.id.includes(prefix)) return item;
    });
  }

  render () {
    const { operations } = this.props;
    const { list } = operations;
    const { count } = list.meta;
    const mutableList = cloneDeep(list);
    //  This data munging should probably be handled in the reducer, but this is a workaround.
    if (mutableList.internal.prefix) {
      if (mutableList.internal.prefix.queryValue) {
        mutableList.data = this.searchOperations(mutableList.data, mutableList.internal.prefix.queryValue);
      } else if (typeof mutableList.internal.prefix === 'string') {
        mutableList.data = this.searchOperations(mutableList.data, mutableList.internal.prefix);
      }
    }

    return (
      <div className='page__component'>
        <Helmet>
          <meta charset= "utf-8" />
          <title> Operations overview </title>
        </Helmet>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description'>Operations Overview</h1>
          </div>
        </section>
        <section className='page__section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>All Operations <span className='num-title'>{tally(count)}</span></h2>
          </div>
          <List
            list={mutableList}
            dispatch={this.props.dispatch}
            action={listOperations}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            rowId='id'
            sortId='createdAt'
          >
            <ListFilters>

              <Search dispatch={this.props.dispatch}
                action={searchOperations}
                clear={clearOperationsSearch}
              />
              <Dropdown
                options={statusOptions}
                action={filterOperations}
                clear={clearOperationsFilter}
                paramKey={'status'}
                label={'Status'}
              />

              <Dropdown
                options={typeOptions}
                action={filterOperations}
                clear={clearOperationsFilter}
                paramKey={'operationType'}
                label={'Type'}
              />

              <Dropdown
                options={pageSizeOptions}
                action={filterOperations}
                clear={clearOperationsFilter}
                paramKey={'limit'}
                label={'Results Per Page'}
              />
            </ListFilters>
          </List>

        </section>
      </div>
    );
  }
}

OperationOverview.propTypes = {
  dispatch: PropTypes.func,
  stats: PropTypes.object,
  operations: PropTypes.object,
  collectionOptions: PropTypes.object,
  workflowOptions: PropTypes.object
};

export default withRouter(connect(state => ({
  stats: state.stats,
  operations: state.operations,
  workflowOptions: workflowOptions(state),
  collectionOptions: collectionOptions(state)
}))(OperationOverview));
