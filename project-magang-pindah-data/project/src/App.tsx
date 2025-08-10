import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { TransferPanel } from './components/TransferPanel';
import { ExcelFile } from './types/excel';
import { FileSpreadsheet, ArrowRightLeft } from 'lucide-react';

function App() {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [targetFile, setTargetFile] = useState<string | null>(null);

  const handleFilesUploaded = useCallback((newFiles: ExcelFile[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile === fileId) setSelectedFile(null);
    if (targetFile === fileId) setTargetFile(null);
  }, [selectedFile, targetFile]);

  const updateFileData = useCallback((fileId: string, sheetName: string, data: any[][]) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          sheets: {
            ...file.sheets,
            [sheetName]: data
          }
        };
      }
      return file;
    }));
  }, []);

  const selectedFileData = files.find(f => f.id === selectedFile);
  const targetFileData = files.find(f => f.id === targetFile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Excel Data Transfer</h1>
              <p className="text-sm text-gray-600">Transfer and process data between Excel files</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel Files</h2>
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </section>

          {files.length > 0 && (
            <>
              {/* File Selection */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source File (Data to extract from)
                    </label>
                    <select
                      value={selectedFile || ''}
                      onChange={(e) => setSelectedFile(e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a file...</option>
                      {files.map(file => (
                        <option key={file.id} value={file.id}>{file.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target File (Data to transfer to)
                    </label>
                    <select
                      value={targetFile || ''}
                      onChange={(e) => setTargetFile(e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a file...</option>
                      {files.map(file => (
                        <option key={file.id} value={file.id}>{file.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Data Preview and Transfer */}
              {selectedFile && targetFile && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Data Transfer</h2>
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Source Data</h3>
                      <DataPreview 
                        file={selectedFileData!}
                        onRemove={() => handleRemoveFile(selectedFile)}
                        isSource={true}
                      />
                    </div>
                    
                    <div className="xl:col-span-1">
                      <TransferPanel
                        sourceFile={selectedFileData!}
                        targetFile={targetFileData!}
                        onUpdateTarget={(sheetName, data) => updateFileData(targetFile, sheetName, data)}
                      />
                    </div>
                    
                    <div className="xl:col-span-1">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Target Data</h3>
                      <DataPreview 
                        file={targetFileData!}
                        onRemove={() => handleRemoveFile(targetFile)}
                        isSource={false}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Files List */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map(file => (
                    <div key={file.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
                          <p className="text-sm text-gray-500">
                            {Object.keys(file.sheets).length} sheet(s)
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.keys(file.sheets).map(sheetName => (
                              <span key={sheetName} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {sheetName}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;