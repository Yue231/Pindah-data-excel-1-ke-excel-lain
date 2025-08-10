import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { ExcelFile } from '../types/excel';

interface FileUploadProps {
  onFilesUploaded: (files: ExcelFile[]) => void;
}

export function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const processFiles = useCallback(async (files: File[]) => {
    const processedFiles: ExcelFile[] = [];

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        
        const sheets: { [sheetName: string]: any[][] } = {};
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false 
          });
          sheets[sheetName] = jsonData as any[][];
        });

        processedFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          sheets,
          file
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    onFilesUploaded(processedFiles);
  }, [onFilesUploaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const excelFiles = acceptedFiles.filter(file => 
      file.name.match(/\.(xlsx|xls|csv)$/i)
    );
    
    if (excelFiles.length > 0) {
      processFiles(excelFiles);
    }
  }, [processFiles]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
        ${isDragActive && !isDragReject 
          ? 'border-blue-500 bg-blue-50' 
          : isDragReject 
          ? 'border-red-500 bg-red-50' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        {isDragActive ? (
          <Upload className="w-12 h-12 text-blue-500 animate-pulse" />
        ) : (
          <FileSpreadsheet className="w-12 h-12 text-gray-400" />
        )}
        
        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragActive 
              ? 'Drop your Excel files here...' 
              : 'Upload Excel Files'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag & drop Excel files (.xlsx, .xls, .csv) or click to browse
          </p>
        </div>
        
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </button>
      </div>

      {isDragReject && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 rounded-lg">
          <p className="text-red-600 font-medium">Only Excel files are supported</p>
        </div>
      )}
    </div>
  );
}