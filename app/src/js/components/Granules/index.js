import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { get } from 'object-path';
import { connect } from 'react-redux';
import { withRouter, Redirect, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { getCount, listGranules } from '../../actions';
import { strings } from '../locale';
import AllGranules from './list';
import DatePickerHeader from '../DatePickerHeader/DatePickerHeader';
import GranuleOverview from './granule';
import GranulesOverview from './overview';
import withQueryParams from 'react-router-query-params';
import { filterQueryParams } from '../../utils/url-helper';

const Granules = ({ dispatch, location, queryParams, stats }) => {
  const { pathname } = location;
  const count = get(stats, 'count.sidebar.granules.count');
  const filteredQueryParams = filterQueryParams(queryParams);
  const queryAsJson = JSON.stringify(queryParams);

  function query() {
    dispatch(listGranules(filteredQueryParams));
  }

  useEffect(() => {
    dispatch(
      getCount({
        type: 'granules',
        field: 'status',
        sidebarCount: true
      })
    );
  }, [dispatch, queryAsJson]);

  return (
    <div className="page__granules">
      <Helmet>
        <title> Granules </title>
      </Helmet>
      <DatePickerHeader onChange={query} heading={strings.granules} />
      <div className="page__content">
        <div className="wrapper__sidebar">
          <Sidebar currentPath={pathname} count={count} location={location} />
          <div className="page__content--shortened">
            <Switch>
              <Route
                exact
                path="/granules"
                render={(props) => (
                  <GranulesOverview
                    queryParams={filteredQueryParams}
                    {...props}
                  />
                )}
              />
              <Route
                path="/granules/granule/:granuleId"
                component={GranuleOverview}
              />
              <Route
                path="/granules/completed"
                render={(props) => (
                  <AllGranules queryParams={filteredQueryParams} {...props} />
                )}
              />
              <Route
                path="/granules/processing"
                render={(props) => (
                  <AllGranules queryParams={filteredQueryParams} {...props} />
                )}
              />
              <Route
                path="/granules/failed"
                render={(props) => (
                  <AllGranules queryParams={filteredQueryParams} {...props} />
                )}
              />
              <Redirect
                exact
                from="/granules/running"
                to="/granules/processing"
              />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

Granules.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
  queryParams: PropTypes.object,
  stats: PropTypes.object,
};

export default withRouter(
  withQueryParams()(
    connect((state) => ({
      stats: state.stats,
    }))(Granules)
  )
);
