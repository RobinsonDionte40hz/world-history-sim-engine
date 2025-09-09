/**
 * TimelineExport Component
 * 
 * Export controls for timeline data in various formats (SVG, PNG, JSON)
 */

import React, { useState } from 'react';
import { Download, FileImage, FileCode, Database } from 'lucide-react';

const TimelineExport = ({ onExport, disabled = false, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('svg');

  const exportOptions = [
    { 
      value: 'svg', 
      label: 'SVG Vector', 
      icon: FileCode, 
      description: 'Scalable vector format' 
    },
    { 
      value: 'png', 
      label: 'PNG Image', 
      icon: FileImage, 
      description: 'High-quality raster image' 
    },
    { 
      value: 'json', 
      label: 'JSON Data', 
      icon: Database, 
      description: 'Structured data export' 
    }
  ];

  const handleExport = async () => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    try {
      await onExport(exportFormat);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`absolute bottom-4 right-4 bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-200 p-3 dark:bg-gray-700 dark:border-gray-500 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Export Format:</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:shadow-[0_0_0_2px_#3b82f6] focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
            disabled={disabled || isExporting}
          >
            {exportOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={disabled || isExporting}
          className="flex items-center gap-2 px-1 py-3 bg-blue-600 text-white text-sm rounded transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Export timeline as ${exportFormat.toUpperCase()}`}
        >
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      {/* Format descriptions */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {exportOptions.map(option => (
          <div 
            key={option.value}
            className={`items-center gap-1 ${exportFormat === option.value ? 'flex' : 'hidden'}`}
          >
            <option.icon size={14} />
            <span>{option.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineExport;
