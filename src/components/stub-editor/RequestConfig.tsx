import React, { useState } from 'react';
import { Plus, Trash2, Code, HelpCircle } from 'lucide-react';
import { Stub } from '../../types/stub';

interface RequestConfigProps {
  stub: Stub;
  onChange: (field: string, value: any) => void;
}

const RequestConfig: React.FC<RequestConfigProps> = ({ stub, onChange }) => {
  const [showUrlHelp, setShowUrlHelp] = useState(false);
  const [showHeadersHelp, setShowHeadersHelp] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newQueryKey, setNewQueryKey] = useState('');
  const [newQueryValue, setNewQueryValue] = useState('');

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('request.method', e.target.value);
  };

  const handleUrlTypeChange = (urlType: string) => {
    // Clear other URL types when changing
    const newRequest = { ...stub.request };
    
    // Reset all URL properties
    delete newRequest.url;
    delete newRequest.urlPath;
    delete newRequest.urlPattern;
    delete newRequest.urlPathPattern;

    // Set the selected one to empty string
    newRequest[urlType as keyof typeof newRequest] = '';
    
    onChange('request', newRequest);
  };

  const handleUrlValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urlType = getSelectedUrlType();
    if (urlType) {
      onChange(`request.${urlType}`, e.target.value);
    }
  };

  const getSelectedUrlType = (): string | null => {
    if (stub.request.urlPath !== undefined) return 'urlPath';
    if (stub.request.urlPattern !== undefined) return 'urlPattern';
    if (stub.request.urlPathPattern !== undefined) return 'urlPathPattern';
    if (stub.request.url !== undefined) return 'url';
    return null;
  };

  const getUrlValue = (): string => {
    const urlType = getSelectedUrlType();
    if (!urlType) return '';
    return stub.request[urlType as keyof typeof stub.request] as string || '';
  };

  // Header management
  const addHeader = () => {
    if (!newHeaderKey || !newHeaderValue) return;
    
    const headers = { ...(stub.request.headers || {}) };
    headers[newHeaderKey] = {
      equalTo: newHeaderValue
    };
    
    onChange('request.headers', headers);
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const removeHeader = (key: string) => {
    const headers = { ...(stub.request.headers || {}) };
    delete headers[key];
    onChange('request.headers', headers);
  };

  // Query parameter management
  const addQueryParam = () => {
    if (!newQueryKey || !newQueryValue) return;
    
    const queryParams = { ...(stub.request.queryParameters || {}) };
    queryParams[newQueryKey] = {
      equalTo: newQueryValue
    };
    
    onChange('request.queryParameters', queryParams);
    setNewQueryKey('');
    setNewQueryValue('');
  };

  const removeQueryParam = (key: string) => {
    const queryParams = { ...(stub.request.queryParameters || {}) };
    delete queryParams[key];
    onChange('request.queryParameters', queryParams);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-navy-500 mb-6">Request Matching Configuration</h3>
      
      {/* HTTP Method */}
      <div className="mb-6">
        <label htmlFor="method" className="block text-sm font-medium text-navy-500 mb-1">
          HTTP Method
        </label>
        <select
          id="method"
          value={stub.request.method}
          onChange={handleMethodChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
          <option value="TRACE">TRACE</option>
          <option value="ANY">ANY</option>
        </select>
      </div>
      
      {/* URL Matching */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="urlType" className="block text-sm font-medium text-navy-500">
            URL Matching
          </label>
          <button 
            type="button" 
            onClick={() => setShowUrlHelp(!showUrlHelp)}
            className="text-gray-400 hover:text-navy-500"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        
        {showUrlHelp && (
          <div className="mb-4 p-3 bg-navy-50 rounded-md text-sm text-navy-700">
            <p><strong>urlPath</strong>: Exact match for URL path (e.g., "/api/users")</p>
            <p><strong>urlPattern</strong>: Regex match for entire URL (e.g., ".*\/users\/[0-9]+")</p>
            <p><strong>urlPathPattern</strong>: Regex match for just the path (e.g., "\/users\/[0-9]+")</p>
            <p><strong>url</strong>: Exact full URL match (e.g., "http://example.com/api/users")</p>
          </div>
        )}
        
        <div className="flex gap-2 mb-2">
          <select
            id="urlType"
            value={getSelectedUrlType() || 'urlPath'}
            onChange={(e) => handleUrlTypeChange(e.target.value)}
            className="block w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="urlPath">URL Path</option>
            <option value="urlPattern">URL Pattern</option>
            <option value="urlPathPattern">URL Path Pattern</option>
            <option value="url">Full URL</option>
          </select>
          
          <input
            type="text"
            value={getUrlValue()}
            onChange={handleUrlValueChange}
            className="flex-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder={getSelectedUrlType() === 'urlPath' ? '/api/users' : '.*\\/users\\/[0-9]+'}
          />
        </div>
      </div>
      
      {/* Headers */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-navy-500">
            Headers
          </label>
          <button 
            type="button" 
            onClick={() => setShowHeadersHelp(!showHeadersHelp)}
            className="text-gray-400 hover:text-navy-500"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        
        {showHeadersHelp && (
          <div className="mb-4 p-3 bg-navy-50 rounded-md text-sm text-navy-700">
            <p>Headers will be matched exactly with the incoming request.</p>
            <p>Common headers: Content-Type, Authorization, Accept</p>
          </div>
        )}
        
        {/* Header List */}
        <div className="bg-gray-50 rounded-md p-3 mb-3">
          {Object.entries(stub.request.headers || {}).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No headers defined</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {Object.entries(stub.request.headers || {}).map(([key, value]) => (
                <li key={key} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{key}: </span>
                    <span className="text-sm text-gray-600">{value.equalTo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Add Header */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newHeaderKey}
            onChange={(e) => setNewHeaderKey(e.target.value)}
            className="w-1/3 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Header name"
          />
          <input
            type="text"
            value={newHeaderValue}
            onChange={(e) => setNewHeaderValue(e.target.value)}
            className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Value"
          />
          <button
            type="button"
            onClick={addHeader}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={!newHeaderKey || !newHeaderValue}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Query Parameters */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-500 mb-1">
          Query Parameters
        </label>
        
        {/* Query Param List */}
        <div className="bg-gray-50 rounded-md p-3 mb-3">
          {Object.entries(stub.request.queryParameters || {}).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No query parameters defined</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {Object.entries(stub.request.queryParameters || {}).map(([key, value]) => (
                <li key={key} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{key}=</span>
                    <span className="text-sm text-gray-600">{value.equalTo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQueryParam(key)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Add Query Param */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newQueryKey}
            onChange={(e) => setNewQueryKey(e.target.value)}
            className="w-1/3 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Parameter name"
          />
          <input
            type="text"
            value={newQueryValue}
            onChange={(e) => setNewQueryValue(e.target.value)}
            className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Value"
          />
          <button
            type="button"
            onClick={addQueryParam}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={!newQueryKey || !newQueryValue}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Body Patterns (Advanced) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-navy-500">
            Body Patterns
          </label>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          Configure advanced body matching patterns in the Advanced tab
        </p>
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-navy-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => onChange('activeTab', 'advanced')}
        >
          <Code className="h-4 w-4 mr-2" />
          Configure Body Matching
        </button>
      </div>
    </div>
  );
};

export default RequestConfig;