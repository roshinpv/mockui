import React, { useState } from 'react';
import { UploadCloud, Download, Server, Database, FileCode, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { importOpenApi, exportStubs } from '../services/api';
import { useStubs } from '../context/StubContext';

const ImportExport: React.FC = () => {
  const { stubs } = useStubs();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('openapi');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [importResults, setImportResults] = useState<{ success: boolean; message: string; count?: number }>({ success: false, message: '' });
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setShowResults(false);
    
    try {
      const fileContents = await readFileAsText(selectedFile);
      
      if (importType === 'openapi') {
        const importedStubs = await importOpenApi(fileContents);
        setImportResults({
          success: true,
          message: 'Successfully imported OpenAPI specification',
          count: importedStubs.length
        });
      } else {
        // For postman or other types, you'd call different import functions
        setImportResults({
          success: false,
          message: 'This import type is not yet implemented'
        });
      }
    } catch (error) {
      setImportResults({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsImporting(false);
      setShowResults(true);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const stubsJson = await exportStubs();
      
      // Create a downloadable blob
      const blob = new Blob([stubsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wiremock-stubs.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Import & Export</h1>
        <p className="mt-1 text-sm text-gray-500">
          Import from OpenAPI/Swagger, Postman or export your stubs
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <UploadCloud className="h-6 w-6 text-indigo-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Import
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Import stubs from OpenAPI specifications and other formats
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Type
              </label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="openapi">OpenAPI / Swagger</option>
                <option value="postman">Postman Collection</option>
                <option value="wiremock">WireMock Stubs</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {importType === 'openapi' && 'Import from OpenAPI v3 or Swagger v2 specifications (.json or .yaml)'}
                {importType === 'postman' && 'Import from Postman Collection v2.1 (.json)'}
                {importType === 'wiremock' && 'Import WireMock stub mappings (.json)'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FileCode className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".json,.yaml,.yml"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedFile ? selectedFile.name : 'JSON or YAML up to 10MB'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    (!selectedFile || isImporting) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Import Results */}
          {showResults && (
            <div className={`mt-6 p-4 rounded-md ${importResults.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {importResults.success ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${importResults.success ? 'text-green-800' : 'text-red-800'}`}>
                    {importResults.success ? 'Import Successful' : 'Import Failed'}
                  </h3>
                  <div className={`mt-2 text-sm ${importResults.success ? 'text-green-700' : 'text-red-700'}`}>
                    <p>{importResults.message}</p>
                    {importResults.success && importResults.count !== undefined && (
                      <p className="mt-1">Created {importResults.count} new stubs</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <Download className="h-6 w-6 text-indigo-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Export
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Export your stubs to a file
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <Server className="h-6 w-6 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{stubs.length} stubs available</p>
                <p className="text-xs text-gray-500 mt-1">All stubs will be exported in WireMock format</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                defaultValue="wiremock"
              >
                <option value="wiremock">WireMock JSON</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Exports in the standard WireMock JSON format
              </p>
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleExport}
                disabled={stubs.length === 0 || isExporting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (stubs.length === 0 || isExporting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {stubs.length} Stubs
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Options</h4>
            <div className="flex space-x-4">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Database className="h-4 w-4 mr-2" />
                Export All Data
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FileCode className="h-4 w-4 mr-2" />
                Export as Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;