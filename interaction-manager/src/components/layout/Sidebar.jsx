import React from 'react';
import styles from './Sidebar.module.css';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { sidebarTabs } from '../../App';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  openSections, 
  toggleSection, 
  theme, 
  setTheme,
  isMobileMenuOpen,
  setIsMobileMenuOpen 
}) => {
  return (
    <div className={styles.sidebarNav}>
      <div className={styles.themeToggle} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </div>
      
      {sidebarTabs.map((section) => (
        <div key={section.key}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection(section.key)}
          >
            <span>{section.label}</span>
            <ChevronDown 
              size={16} 
              className={openSections[section.key] ? `${styles.sectionChevron} ${styles.open}` : styles.sectionChevron}
            />
          </div>
          
          {openSections[section.key] && (
            <div className={styles.sectionItems}>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  className={activeTab === item.key ? `${styles.sidebarItem} ${styles.active}` : styles.sidebarItem}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar; 