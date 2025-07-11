import React from 'react';
import styles from './Card.module.css';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  ...props
}) => {
  return (
    <div
      className={`${styles.card} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`${styles.cardHeader} ${headerClassName}`}>
          {title && (
            <h3 className={styles.cardTitle}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={styles.cardSubtitle}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={`${styles.cardBody} ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className={`${styles.cardFooter} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 