import React from 'react';
import PropTypes from 'prop-types';

export const maxDisplayed = 10;

const BatchReingestConfirmContent = ({ selected = [] }) => {
  const isMultiple = selected.length > 1;
  const these = isMultiple ? 'These' : 'This';
  const s = isMultiple ? 's' : '';
  const requestText = `You have submitted a request to reingest the following granule${s}.`;
  const confirmText = `Are you sure that you want to reingest ${these.toLowerCase()} granule${s}?\nNote: ${these} granule file${s} will be overwritten.`;

  const displayedItems = () => {
    const items = [];
    for (let i = 0; i < Math.min(selected.length, maxDisplayed); i++) {
      items.push(<li key={i}>{selected[i]}</li>);
    }
    if (selected.length > maxDisplayed) {
      items.push(<li key={maxDisplayed}>and {selected.length - maxDisplayed} more.</li>);
    }
    return items;
  };

  return (
    <>
      {requestText}
      <ul>
        {displayedItems()}
      </ul>
      {confirmText.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </>
  );
};

BatchReingestConfirmContent.propTypes = {
  selected: PropTypes.array
};

export default BatchReingestConfirmContent;
