import React from 'react';
import Slider from './Slider';

const Toolbar = ({ onExport, onFilter, onHighlight }) => {
  return (
    <div className="toolbar">
      <div className="slider-container">
        <label htmlFor="time-slider">Time:</label>
        <Slider id="time-slider" />
      </div>
      <button className="export-button" onClick={onExport}>
        Export
      </button>
    </div>
  );
};

export default Toolbar;
