import React, { useState } from 'react';
import styles from './Tooltip.module.css';

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className={styles.tooltipWrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      tabIndex={0}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && <span className={styles.tooltipContent}>{content}</span>}
    </span>
  );
} 