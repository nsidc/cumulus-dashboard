'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Redirect, Route, Switch } from 'react-router-dom';
import Sidebar from '../Sidebar/sidebar';
import { strings } from '../locale';
import CollectionList from '../../components/Collections/list';
import AddCollection from '../../components/Collections/add';
import EditCollection from '../../components/Collections/edit';
import CollectionOverview from '../../components/Collections/overview';
import CollectionGranules from '../../components/Collections/granules';
import CollectionIngest from '../../components/Collections/ingest';
import CollectionLogs from '../../components/Collections/logs';
import DatePickerHeader from '../../components/DatePickerHeader/DatePickerHeader';
import { listCollections } from '../../actions';

class Collections extends React.Component {
  query() {
    this.props.dispatch(listCollections());
  }

  render() {
    const { pathname } = this.props.location;
    const existingCollection = pathname !== '/collections/add';

    return (
      <div className="page__collections">
        <DatePickerHeader onChange={this.query} heading={strings.collections} />
        <div className="page__content">
          <div className="wrapper__sidebar">
            <Route path="/collections/all" component={Sidebar} />
            <Route
              path="/collections/edit/:name/:version"
              component={Sidebar}
            />
            <Route
              path="/collections/collection/:name/:version"
              component={Sidebar}
            />
            <div
              className={
                existingCollection
                  ? 'page__content--shortened'
                  : 'page__content'
              }
            >
              <Switch>
                <Redirect
                  exact
                  from="/collections"
                  to={{
                    pathname: '/collections/all',
                    search: this.props.location.search,
                  }}
                />
                <Route path="/collections/all" component={CollectionList} />
                <Route path="/collections/add" component={AddCollection} />
                <Route
                  exact
                  path="/collections/edit/:name/:version"
                  component={EditCollection}
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version"
                  component={CollectionOverview}
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version/granules"
                  component={CollectionGranules}
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version/granules/completed"
                  component={CollectionGranules}
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version/granules/processing"
                  component={CollectionGranules}
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version/granules/failed"
                  component={CollectionGranules}
                />
                <Redirect
                  exact
                  from="/collections/collection/:name/:version/granules/running"
                  to="/collections/collection/:name/:version/granules/processing"
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version/definition"
                  component={CollectionIngest}
                />
                <Route
                  exact
                  path="/collections/collection/:name/:version/logs"
                  component={CollectionLogs}
                />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Collections.displayName = strings.collection;

Collections.propTypes = {
  children: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
};

export default withRouter(connect()(Collections));
