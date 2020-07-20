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
  listCollections,
  listOperations,
  listWorkflows
} from '../../actions';
import { tally } from '../../utils/format';
import List from '../Table/Table';
import Dropdown from '../DropDown/dropdown';
import Search from '../Search/search';
import { tableColumns } from '../../utils/table-config/operations';
import ListFilters from '../ListActions/ListFilters';
import pageSizeOptions from '../../utils/page-size';

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
    this.queryMeta();
    this.props.dispatch(getCumulusInstanceMetadata());
  }

  generateQuery () {
    return { ...this.props.queryParams };
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

  searchOperations (list, infix) {
    return list.filter((item) => {
      if (item.id.includes(infix)) return item;
    });
  }

  render () {
    const { dispatch, operations } = this.props;
    const { list } = operations;
    const { count } = list.meta;
    const mutableList = cloneDeep(list);
    //  This data munging should probably be handled in the reducer, but this is a workaround.
    if (mutableList.internal.infix) {
      if (mutableList.internal.infix.queryValue) {
        mutableList.data = this.searchOperations(mutableList.data, mutableList.internal.infix.queryValue);
      } else if (typeof mutableList.internal.infix === 'string') {
        mutableList.data = this.searchOperations(mutableList.data, mutableList.internal.infix);
      }
    }

    return (
      <div className='page__component'>
        <Helmet>
          <title> Operations Overview </title>
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
            dispatch={dispatch}
            action={listOperations}
            tableColumns={tableColumns}
            query={this.generateQuery()}
            rowId='id'
            sortId='createdAt'
          >
            <ListFilters>

              <Search dispatch={dispatch}
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
  operations: PropTypes.object,
  queryParams: PropTypes.object,
};

export default withRouter(connect(state => ({
  operations: state.operations,
}))(OperationOverview));
