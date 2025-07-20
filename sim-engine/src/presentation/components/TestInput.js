import React, { useState } from 'react';

// Ultra minimal test component to isolate typing issues
const TestInput = () => {
  const [value, setValue] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Typing Test</h2>
      <p>Can you type continuously without interruption?</p>
      
      <label>
        Test Input:
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type here to test..."
          style={{
            display: 'block',
            width: '300px',
            padding: '8px',
            margin: '8px 0',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </label>
      
      <p>Current value: {value}</p>
      <p>Length: {value.length}</p>
    </div>
  );
};

export default TestInput;
