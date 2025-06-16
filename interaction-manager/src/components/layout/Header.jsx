import React from 'react';
import styles from './Header.module.css';
import { Menu, Upload, Download, Trash2, Sun, Moon } from 'lucide-react';

const Header = ({ 
  theme,
  setTheme,
  onExport, 
  onImport, 
  onClearData 
}) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Interaction Manager</h1>

      <div className={styles.headerControls}>
        <button 
          className={styles.themeToggle}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className={styles.dataControls}>
          <button className="btn" onClick={onExport}>
            <Download size={18} />
            Export
          </button>
          <label className="btn">
            <Upload size={18} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-danger" onClick={onClearData}>
            <Trash2 size={18} />
            Clear Data
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 