import React from 'react';
import styles from './Header.module.css';
import { Menu, Upload, Download, Trash2 } from 'lucide-react';

const Header = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleExport, 
  handleImport, 
  handleClearData 
}) => {
  return (
    <header className={styles.header}>
      <button 
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={24} />
      </button>

      <h1 className={styles.headerTitle}>Interaction Manager</h1>

      <div className={styles.dataControls}>
        <button className="btn" onClick={handleExport}>
          <Download size={18} />
          Export
        </button>
        <label className="btn">
          <Upload size={18} />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
        <button className="btn btn-danger" onClick={handleClearData}>
          <Trash2 size={18} />
          Clear Data
        </button>
      </div>
    </header>
  );
};

export default Header; 