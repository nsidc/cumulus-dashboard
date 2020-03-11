'use strict';
import Collapse from 'react-collapsible';
import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'object-path';
import { isUndefined } from '../../utils/validate';
import { nullValue } from '../../utils/format';

const defaultSortOrder = 'desc';
const otherOrder = {
  desc: 'asc',
  asc: 'desc'
};

class Table extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      dumbOrder: null,
      dumbSortIdx: null
    };
    this.displayName = 'SortableTable';
    this.isTableDumb = this.isTableDumb.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.select = this.select.bind(this);
  }

  isTableDumb () {
    // identify whether the table is "dumb," as in it doesn't
    // do its own data-updating, and cannot be sorted via its API call
    return isUndefined(this.props.sortIdx) || !this.props.order || !Array.isArray(this.props.props);
  }

  changeSort (e) {
    let { sortIdx, order, props, header } = this.props;
    const isTableDumb = this.isTableDumb();

    if (isTableDumb) {
      sortIdx = this.state.dumbSortIdx;
      order = this.state.dumbOrder;
    }

    const headerName = e.currentTarget.getAttribute('data-value');
    const newSortIdx = header.indexOf(headerName);
    if (!props[newSortIdx]) { return; }
    const newOrder = sortIdx === newSortIdx ? otherOrder[order] : defaultSortOrder;

    if (typeof this.props.changeSortProps === 'function') {
      this.props.changeSortProps({ sortIdx: newSortIdx, order: newOrder });
    }
    if (isTableDumb) {
      this.setState({ dumbSortIdx: newSortIdx, dumbOrder: newOrder });
    }
  }

  select (e) {
    if (typeof this.props.onSelect === 'function') {
      const targetId = (e.currentTarget.getAttribute('data-value'));
      this.props.onSelect(targetId);
    }
  }

  render () {
    let { primaryIdx, sortIdx, order, props, header, row, rowId, data, selectedRows, canSelect, collapsible } = this.props;
    const isTableDumb = this.isTableDumb();
    primaryIdx = primaryIdx || 0;

    if (isTableDumb) {
      props = [];
      sortIdx = this.state.dumbSortIdx;
      order = this.state.dumbOrder;
      const sortName = props[sortIdx];
      const primaryName = props[primaryIdx];
      data = data.sort((a, b) =>
        // If the sort field is the same, tie-break using the primary ID field
        a[sortName] === b[sortName] ? a[primaryName] > b[primaryName]
          : (order === 'asc') ? a[sortName] < b[sortName] : a[sortName] > b[sortName]
      );
    }

    return (
      <div className='table--wrapper'>
        <form>
          <table>
            <thead>
              <tr>
                {canSelect && <td/> }
                {header.map((h, i) => {
                  let className = (isTableDumb || props[i]) ? 'table__sort' : '';
                  if (i === sortIdx) { className += (' table__sort--' + order); }
                  return (
                    <td
                      className={className}
                      key={h}
                      data-value={h}
                      onClick={this.changeSort}>{h}
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {(data || []).map((d, i) => {
                const dataId = typeof rowId === 'function' ? rowId(d) : d[rowId];
                const checked = canSelect && selectedRows.indexOf(dataId) !== -1;
                return (
                  <tr key={i} data-value={dataId} onClick={this.select}>
                    {canSelect &&
                      <td>
                        <input type={'checkbox'} checked={checked} readOnly/>
                      </td>
                    }
                    {row.map((accessor, k) => {
                      let className = k === primaryIdx ? 'table__main-asset' : '';
                      let text;

                      if (typeof accessor === 'function') {
                        text = accessor(d, k, data);
                      } else {
                        text = get(d, accessor, nullValue);
                      }
                      return <td key={String(i) + String(k) + text} className={className}>{text}</td>;
                    })}
                    {collapsible &&
                      <td>
                        <Collapse trigger={'More Details'} triggerWhenOpen={'Less Details'}>
                          <pre className={'pre-style'}>{JSON.stringify(d.eventDetails, null, 2)}</pre>
                        </Collapse>
                      </td>
                    }
                  </tr>
                );
              })}
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

Table.propTypes = {
  primaryIdx: PropTypes.number,
  data: PropTypes.array,
  header: PropTypes.array,
  props: PropTypes.array,
  row: PropTypes.array,
  sortIdx: PropTypes.number,
  order: PropTypes.string,
  changeSortProps: PropTypes.func,
  onSelect: PropTypes.func,
  canSelect: PropTypes.bool,
  collapsible: PropTypes.bool,
  selectedRows: PropTypes.array,
  rowId: PropTypes.any
};

export default Table;
