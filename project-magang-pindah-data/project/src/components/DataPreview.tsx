import React, { useState } from 'react';
import { ExcelFile } from '../types/excel';
import { Download, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataPreviewProps {
  file: ExcelFile;
  onRemove: () => void;
  isSource: boolean;
}

export function DataPreview({ file, onRemove, isSource }: DataPreviewProps) {
  const [selectedSheet, setSelectedSheet] = useState(Object.keys(file.sheets)[0]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentData = file.sheets[selectedSheet] || [];
  const headers = currentData[0] || [];
  const rows = currentData.slice(1, 11); // Show first 10 rows

  const downloadFile = () => {
    const workbook = XLSX.utils.book_new();
    
    Object.entries(file.sheets).forEach(([sheetName, data]) => {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, file.name);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isSource ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isSource ? 'Source' : 'Target'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={downloadFile}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {Object.keys(file.sheets).length > 1 && !isCollapsed && (
          <div className="mt-2">
            <select
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.keys(file.sheets).map(sheetName => (
                <option key={sheetName} value={sheetName}>{sheetName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-4">
          {currentData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header: any, index: number) => (
                      <th
                        key={index}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header || `Column ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {headers.map((_: any, colIndex: number) => (
                        <td
                          key={colIndex}
                          className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[colIndex] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {currentData.length > 11 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Showing first 10 rows of {currentData.length - 1} total rows
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>
      )}
    </div>
  );
}