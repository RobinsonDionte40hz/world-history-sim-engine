import React, { useState } from 'react';

// Completely isolated JSON textarea component
const IsolatedJSONTextarea = ({ label, initialValue = '{}', onBlur, placeholder, maxLength = 2000, rows = 8 }) => {
  const [localValue, setLocalValue] = useState(initialValue);
  
  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };
  
  const handleBlur = () => {
    if (onBlur) {
      onBlur(localValue);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
        {label}
      </label>
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          resize: 'vertical'
        }}
      />
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        Enter as JSON - Max {maxLength} characters
      </div>
    </div>
  );
};

export default IsolatedJSONTextarea;