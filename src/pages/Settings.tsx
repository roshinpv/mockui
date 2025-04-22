import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Clock, AlertTriangle, Server, Database, GitBranch } from 'lucide-react';

const Settings: React.FC = () => {
  const [globalDelay, setGlobalDelay] = useState<number>(0);
  const [enableTemplating, setEnableTemplating] = useState<boolean>(true);
  const [proxyBaseUrl, setProxyBaseUrl] = useState<string>('');
  const [serverPort, setServerPort] = useState<number>(8080);
  const [journalSize, setJournalSize] = useState<number>(1000);
  const [persistJournal, setPersistJournal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    try {
      // In a real app, this would call an API to save the settings
      
      setSuccessMessage('Settings saved successfully');
      setErrorMessage(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setErrorMessage('Failed to save settings');
      setSuccessMessage(null);
    }
  };

  const handleReset = () => {
    setGlobalDelay(0);
    setEnableTemplating(true);
    setProxyBaseUrl('');
    setServerPort(8080);
    setJournalSize(1000);
    setPersistJournal(false);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure global WireMock settings
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <SettingsIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <Server className="h-6 w-6 text-indigo-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Server Configuration
            </h3>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div>
            <label htmlFor="serverPort" className="block text-sm font-medium text-gray-700">
              WireMock Server Port
            </label>
            <input
              type="number"
              id="serverPort"
              value={serverPort}
              onChange={(e) => setServerPort(parseInt(e.target.value, 10) || 8080)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Port that the WireMock server is running on (requires restart to apply)
            </p>
          </div>
          
          <div>
            <label htmlFor="proxyBaseUrl" className="block text-sm font-medium text-gray-700">
              Proxy Base URL
            </label>
            <input
              type="text"
              id="proxyBaseUrl"
              value={proxyBaseUrl}
              onChange={(e) => setProxyBaseUrl(e.target.value)}
              placeholder="http://api.example.com"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Base URL to proxy requests to when no matching stub is found (leave empty to disable)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <GitBranch className="h-6 w-6 text-indigo-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Response Settings
            </h3>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div>
            <label htmlFor="globalDelay" className="block text-sm font-medium text-gray-700">
              Global Response Delay (ms)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm items-center">
              <input
                type="range"
                id="globalDelay"
                min="0"
                max="10000"
                step="100"
                value={globalDelay}
                onChange={(e) => setGlobalDelay(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={globalDelay}
                min="0"
                max="60000"
                onChange={(e) => setGlobalDelay(parseInt(e.target.value, 10) || 0)}
                className="ml-4 w-24 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-500">ms</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Delay all responses by this amount (adds to any stub-specific delays)
            </p>
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="enableTemplating"
                name="enableTemplating"
                type="checkbox"
                checked={enableTemplating}
                onChange={(e) => setEnableTemplating(e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="enableTemplating" className="font-medium text-gray-700">
                Enable Response Templating
              </label>
              <p className="text-gray-500">
                Allow Handlebars-style templates to be used in stub responses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-indigo-500 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Request Journal
            </h3>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div>
            <label htmlFor="journalSize" className="block text-sm font-medium text-gray-700">
              Journal Size
            </label>
            <input
              type="number"
              id="journalSize"
              value={journalSize}
              onChange={(e) => setJournalSize(parseInt(e.target.value, 10) || 100)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum number of requests to store in the journal
            </p>
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="persistJournal"
                name="persistJournal"
                type="checkbox"
                checked={persistJournal}
                onChange={(e) => setPersistJournal(e.target.checked)}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="persistJournal" className="font-medium text-gray-700">
                Persist Request Journal
              </label>
              <p className="text-gray-500">
                Save request journal to disk (will survive server restarts)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={handleSaveSettings}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;