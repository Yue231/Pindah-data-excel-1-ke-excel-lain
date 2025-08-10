import React, { useState, useMemo } from 'react';
import { ExcelFile, ColumnStats } from '../types/excel';
import { Calculator, ArrowRight, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface TransferPanelProps {
  sourceFile: ExcelFile;
  targetFile: ExcelFile;
  onUpdateTarget: (sheetName: string, data: any[][]) => void;
}

export function TransferPanel({ sourceFile, targetFile, onUpdateTarget }: TransferPanelProps) {
  const [selectedSourceSheet, setSelectedSourceSheet] = useState(Object.keys(sourceFile.sheets)[0]);
  const [selectedTargetSheet, setSelectedTargetSheet] = useState(Object.keys(targetFile.sheets)[0]);
  const [selectedColumn, setSelectedColumn] = useState<number>(0);
  const [selectedOperation, setSelectedOperation] = useState<'average' | 'sum' | 'min' | 'max' | 'count'>('average');
  const [targetRow, setTargetRow] = useState<number>(0);
  const [targetCol, setTargetCol] = useState<number>(0);

  const sourceData = sourceFile.sheets[selectedSourceSheet] || [];
  const targetData = targetFile.sheets[selectedTargetSheet] || [];
  const sourceHeaders = sourceData[0] || [];

  const columnStats = useMemo((): ColumnStats | null => {
    if (!sourceData || sourceData.length < 2 || selectedColumn >= sourceHeaders.length) {
      return null;
    }

    const values = sourceData.slice(1)
      .map(row => row[selectedColumn])
      .filter(value => value !== '' && value !== null && value !== undefined)
      .map(value => typeof value === 'number' ? value : parseFloat(String(value)))
      .filter(value => !isNaN(value));

    if (values.length === 0) return null;

    return {
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      sum: values.reduce((sum, val) => sum + val, 0),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }, [sourceData, selectedColumn, sourceHeaders.length]);

  const handleTransfer = () => {
    if (!columnStats) return;

    const newTargetData = [...targetData];
    
    // Ensure target data has enough rows and columns
    while (newTargetData.length <= targetRow) {
      newTargetData.push([]);
    }
    
    while (newTargetData[targetRow].length <= targetCol) {
      newTargetData[targetRow].push('');
    }

    // Insert the calculated value
    const valueToInsert = columnStats[selectedOperation];
    newTargetData[targetRow][targetCol] = typeof valueToInsert === 'number' 
      ? Math.round(valueToInsert * 100) / 100 
      : valueToInsert;

    onUpdateTarget(selectedTargetSheet, newTargetData);
  };

  const operationIcons = {
    average: <Calculator className="w-4 h-4" />,
    sum: <BarChart3 className="w-4 h-4" />,
    min: <TrendingDown className="w-4 h-4" />,
    max: <TrendingUp className="w-4 h-4" />,
    count: <BarChart3 className="w-4 h-4" />
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        Data Transfer Settings
      </h3>

      <div className="space-y-4">
        {/* Source Configuration */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-3">Source Configuration</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source Sheet</label>
              <select
                value={selectedSourceSheet}
                onChange={(e) => setSelectedSourceSheet(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {Object.keys(sourceFile.sheets).map(sheetName => (
                  <option key={sheetName} value={sheetName}>{sheetName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Column to Process</label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(parseInt(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sourceHeaders.map((header: any, index: number) => (
                  <option key={index} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Operation</label>
              <select
                value={selectedOperation}
                onChange={(e) => setSelectedOperation(e.target.value as any)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="average">Average</option>
                <option value="sum">Sum</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
                <option value="count">Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculation Results */}
        {columnStats && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-3">Calculation Results</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Average:</span>
                <span className="font-medium">{Math.round(columnStats.average * 100) / 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sum:</span>
                <span className="font-medium">{Math.round(columnStats.sum * 100) / 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min:</span>
                <span className="font-medium">{columnStats.min}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max:</span>
                <span className="font-medium">{columnStats.max}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-600">Count:</span>
                <span className="font-medium">{columnStats.count} values</span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white rounded border">
              <div className="flex items-center gap-2">
                {operationIcons[selectedOperation]}
                <span className="text-sm font-medium">
                  Selected Value: {Math.round(columnStats[selectedOperation] * 100) / 100}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Target Configuration */}
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-800 mb-3">Target Configuration</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Sheet</label>
              <select
                value={selectedTargetSheet}
                onChange={(e) => setSelectedTargetSheet(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {Object.keys(targetFile.sheets).map(sheetName => (
                  <option key={sheetName} value={sheetName}>{sheetName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Row</label>
                <input
                  type="number"
                  min="0"
                  value={targetRow}
                  onChange={(e) => setTargetRow(parseInt(e.target.value) || 0)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Column</label>
                <input
                  type="number"
                  min="0"
                  value={targetCol}
                  onChange={(e) => setTargetCol(parseInt(e.target.value) || 0)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={!columnStats}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {operationIcons[selectedOperation]}
          Transfer {selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}