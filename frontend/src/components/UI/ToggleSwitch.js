import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ id, checked, onChange }) => {
  return (
    <div className="toggle-switch">
      <input 
        type="checkbox" 
        id={id} 
        checked={checked} 
        onChange={onChange} 
      />
      <span className="toggle-slider"></span>
    </div>
  );
};

export default ToggleSwitch;