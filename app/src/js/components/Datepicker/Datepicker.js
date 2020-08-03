import isEmpty from 'lodash.isempty';
import isNil from 'lodash.isnil';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import DateTimePicker from 'react-datetime-picker';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import withQueryParams from 'react-router-query-params';
import {
  DATEPICKER_DATECHANGE,
  DATEPICKER_DROPDOWN_FILTER,
  DATEPICKER_HOUR_FORMAT
} from '../../actions/types';
import {
  allDateRanges,
  allHourFormats,
  dropdownValue,
  dateTimeFormat,
  urlDateFormat,
  urlDateProps,
  findDateRangeByValue
} from '../../utils/datepicker';

/*
 * If this is a shared URL, grab the date and time and update the datepicker
 * state to reflect the values.
 * @param {Object} props - Home component's input props.
 */
const updateDatepickerStateFromQueryParams = (props) => {
  const { queryParams } = props;

  if (!isEmpty(queryParams)) {
    const values = { ...queryParams };

    for (const value in values) {
      if (urlDateProps.includes(value)) {
        values[value] = moment.utc(values[value], urlDateFormat).valueOf();
      }
    }

    values.dateRange = dropdownValue(values);
    props.dispatch({
      type: DATEPICKER_DATECHANGE,
      data: { ...props.datepicker, ...values }
    });
  }
};

/**
 * Component representing the Datepicker.
 * Use by adding <Datepicker />. Update the connected state.datepicker to make changes.
 */
class Datepicker extends React.PureComponent {
  constructor (props) {
    super(props);
    this.onChange = props.onChange || (() => {});
    this.handleDropdownChange = this.handleDropdownChange.bind(this);
    this.handleHourFormatChange = this.handleHourFormatChange.bind(this);
    this.handleDateTimeRangeChange = this.handleDateTimeRangeChange.bind(this);
    this.clear = this.clear.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount () {
    updateDatepickerStateFromQueryParams(this.props);
  }

  refresh (e) {
    const { value, label } = this.props.dateRange;
    if (label !== 'Custom') {
      this.props.dispatch(this.dispatchDropdownUpdate(value, label));
    }
  }

  clear () {
    const { value, label } = findDateRangeByValue('Custom');
    this.props.dispatch(this.dispatchDropdownUpdate(value, label));
  }

  dispatchDropdownUpdate (value, label) {
    return (dispatch, getState) => {
      dispatch({
        type: DATEPICKER_DROPDOWN_FILTER,
        data: { dateRange: { value, label } }
      });
      const datepickerState = getState().datepicker;
      this.updateQueryParams(datepickerState);
      this.onChange();
    };
  }

  handleDropdownChange (e) {
    const { value, label } = allDateRanges[e.target.selectedIndex];
    this.props.dispatch(this.dispatchDropdownUpdate(value, label));
  }

  handleHourFormatChange (e) {
    this.props.dispatch({
      type: DATEPICKER_HOUR_FORMAT,
      data: e.target.value
    });
  }

  handleDateTimeRangeChange (name, newValue) {
    // User input is in UTC, but the DateTimePicker component interprets it's
    // data as local time.  So we need convert the Date value to UTC.
    let utcValue = null;
    if (newValue !== null) {
      utcValue = moment.utc(moment(newValue).format(dateTimeFormat)).valueOf();
      if (isNaN(utcValue)) return;
    }
    const updatedProps = {
      startDateTime: this.props.startDateTime,
      endDateTime: this.props.endDateTime,
      [name]: utcValue
    };
    updatedProps.dateRange = findDateRangeByValue('Custom');
    this.props.dispatch({ type: DATEPICKER_DATECHANGE, data: updatedProps });
    this.updateQueryParams(updatedProps);
    this.onChange();
  }

  updateQueryParams (newProps) {
    const updatedQueryParams = { ...this.props.queryParams };
    urlDateProps.map((time) => {
      let urlValue;
      if (newProps[time] !== null) {
        urlValue = moment.utc(newProps[time]).format(urlDateFormat);
      }
      updatedQueryParams[time] = urlValue;
    });
    this.props.setQueryParams(updatedQueryParams);
  }

  renderDateRangeDropDown () {
    return (
      <React.Fragment>
        <div className='datetime dropdown__dtrange'>
          <select
            name='dateRange'
            value={this.props.dateRange.value}
            onChange={this.handleDropdownChange}
            data-cy='datetime-dropdown'
          >
            {allDateRanges.map((option, i) => (
              <option value={option.value} key={i}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </React.Fragment>
    );
  }

  renderHourFormatSelect () {
    const name = 'hourFormat';

    return (
      <React.Fragment>
        <div className='datetime selector__hrformat'>
          <select
            type='text'
            name={name}
            value={this.props.hourFormat.value}
            onChange={this.handleHourFormatChange}
          >
            {allHourFormats.map((option, i) => (
              <option value={option.value} key={i}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </React.Fragment>
    );
  }

  renderDateTimeRange (name) {
    const hourFormat = this.props.hourFormat;
    const value = this.props[name];
    const locale = hourFormat === '24HR' ? 'en-GB' : 'en-US';
    const format = `MM/dd/yyyyy ${hourFormat === '24HR' ? 'HH:mm' : 'hh:mm a'}`;

    const utcValue = isNil(value)
      ? null
      : moment(moment.utc(value).format(dateTimeFormat)).toDate();

    return (
      <DateTimePicker
        dayPlaceholder='DD'
        format={format}
        hourPlaceholder='HH'
        locale={locale}
        monthPlaceholder='MM'
        minutePlaceholder='mm'
        name={name}
        onChange={(value) => this.handleDateTimeRangeChange(name, value)}
        value={utcValue}
        yearPlaceholder='YYYY'
      />
    );
  }

  render () {
    return (
      <div className='datetime__module'>
        <div className='datetime'>
          <div className='datetime__range'>
            <ul className='datetime__internal'>
              <li>
                <label>Duration</label>
                {this.renderDateRangeDropDown()}
              </li>
              <li data-cy='startDateTime'>
                <label>Start Date and Time</label>
                {this.renderDateTimeRange('startDateTime')}
              </li>
              <li data-cy='endDateTime'>
                <label>End Date and Time</label>
                {this.renderDateTimeRange('endDateTime')}
              </li>
              <li className='selector__hrformat' data-cy='hourFormat'>
                <label>Time Format</label>
                {this.renderHourFormatSelect()}
              </li>
              {this.props.hideWrapper || (
                <li className='datetime__clear'>
                  <button
                    className='button button--secondary button--small'
                    onClick={this.clear}
                    data-cy='datetime-clear'
                  >
                    Clear All
                  </button>
                </li>
              )}
            </ul>
          </div>
          {this.props.hideWrapper || (
            <div className='datetime__wrapper'>
              <ul className='datetime__header'>
                <li>
                  <h3>Date and Time Range</h3>
                </li>
                <li>
                  <div className='datetime__refresh'>
                    <button
                      className='button button--small'
                      onClick={this.refresh}
                      data-cy='datetime-refresh'
                    >
                      Refresh Time
                    </button>
                  </div>
                </li>
              </ul>
              <hr></hr>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Datepicker.propTypes = {
  name: PropTypes.string,
  dateRange: PropTypes.shape({
    value: PropTypes.node,
    label: PropTypes.string
  }),
  startDateTime: PropTypes.number,
  endDateTime: PropTypes.number,
  hourFormat: PropTypes.oneOf(allHourFormats.map((a) => a.label)),
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  onChange: PropTypes.func,
  dispatch: PropTypes.func,
  hideWrapper: PropTypes.bool,
};

export default withRouter(
  withQueryParams()(connect(state => state.datepicker)(Datepicker))
);
