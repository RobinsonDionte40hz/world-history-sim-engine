import React from 'react';

const Slider = ({ id }) => {
  return (
    <input type="range" id={id} className="slider" min="0" max="100" />
  );
};

export default Slider;
