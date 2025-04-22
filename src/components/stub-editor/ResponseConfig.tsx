import React, { useState } from 'react';
import { AlertTriangle, Clock, HelpCircle } from 'lucide-react';
import { Stub } from '../../types/stub';

interface ResponseConfigProps {
  stub: Stub;
  onChange: (field: string, value: any) => void;
}

const ResponseConfig: React.FC<ResponseConfigProps> = ({ stub, onChange }) => {
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [showTemplatingHelp, setShowTemplatingHelp] = useState(false);
  const [showFaultHelp, setShowFaultHelp] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const status = parseInt(e.target.value, 10) || 200;
    onChange('response.status', status);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange('response.body', e.target.value);
  };

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const delay = parseInt(e.target.value, 10) || 0;
    onChange('response.fixedDelayMilliseconds', delay);
  };

  const addHeader = () => {
    if (!newHeaderKey || !newHeaderValue) return;
    
    const headers = { ...(stub.response.headers || {}) };
    headers[newHeaderKey] = newHeaderValue;
    
    onChange('response.headers', headers);
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const removeHeader = (key: string) => {
    const headers = { ...(stub.response.headers || {}) };
    delete headers[key];
    onChange('response.headers', headers);
  };

  const handleFaultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "none") {
      const { fault, ...responseWithoutFault } = stub.response;
      onChange('response', responseWithoutFault);
    } else {
      onChange('response.fault', value);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-navy-500 mb-6">Response Configuration</h3>
      
      {/* Status Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-500 mb-1">
          Status Code
        </label>
        <input
          type="number"
          min="100"
          max="599"
          value={stub.response.status}
          onChange={handleStatusChange}
          className="w-32 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        />
        
        <div className="mt-2 flex items-center text-sm">
          {stub.response.status >= 200 && stub.response.status < 300 && (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Success
            </span>
          )}
          {stub.response.status >= 300 && stub.response.status < 400 && (
            <span className="px-2 py-1 rounded-full bg-secondary-100 text-secondary-800 text-xs font-medium">
              Redirect
            </span>
          )}
          {stub.response.status >= 400 && stub.response.status < 500 && (
            <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium">
              Client Error
            </span>
          )}
          {stub.response.status >= 500 && (
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
              Server Error
            </span>
          )}
        </div>
      </div>
      
      {/* Headers */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-500 mb-1">
          Response Headers
        </label>
        
        {/* Header List */}
        <div className="bg-gray-50 rounded-md p-3 mb-3 max-h-48 overflow-y-auto">
          {Object.entries(stub.response.headers || {}).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No headers defined</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {Object.entries(stub.response.headers || {}).map(([key, value]) => (
                <li key={key} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{key}: </span>
                    <span className="text-sm text-gray-600">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <span className="text-xs">Remove</span>
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
            placeholder="Content-Type"
          />
          <input
            type="text"
            value={newHeaderValue}
            onChange={(e) => setNewHeaderValue(e.target.value)}
            className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="application/json"
          />
          <button
            type="button"
            onClick={addHeader}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={!newHeaderKey || !newHeaderValue}
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Response Body */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-navy-500">
            Response Body
          </label>
          <button 
            type="button" 
            onClick={() => setShowTemplatingHelp(!showTemplatingHelp)}
            className="text-gray-400 hover:text-navy-500"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        
        {showTemplatingHelp && (
          <div className="mb-4 p-3 bg-navy-50 rounded-md text-xs text-navy-700">
            <p className="font-medium mb-1">Response Templating Examples:</p>
            <p><code>{"{{request.path}}"}</code> - The full path of the request URL</p>
            <p><code>{"{{request.query.name}}"}</code> - Query parameter 'name'</p>
            <p><code>{"{{request.headers.Content-Type}}"}</code> - Content-Type header</p>
            <p><code>{"{{jsonPath request.body '$.user.id'}}"}</code> - JSONPath from request body</p>
            <p><code>{"{{randomValue type='UUID'}}"}</code> - Random UUID</p>
            <p><code>{"{{now format='yyyy-MM-dd HH:mm:ss'}}"}</code> - Current date/time</p>
          </div>
        )}
        
        <textarea
          value={stub.response.body || ''}
          onChange={handleBodyChange}
          rows={12}
          className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder='{"message": "Hello, {{request.query.name}}!"}'
        />

        <div className="flex justify-between mt-2">
          <div className="flex items-center">
            <span className="text-xs text-gray-500">
              Suggestion: Add <code className="bg-gray-100 px-1 rounded">Content-Type</code> header for proper rendering
            </span>
          </div>
          <button
            type="button" 
            className="text-xs text-primary-600 hover:text-primary-800"
            onClick={() => {
              const headers = { ...(stub.response.headers || {}) };
              if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
                onChange('response.headers', headers);
              }
            }}
          >
            Add Content-Type: application/json
          </button>
        </div>
      </div>
      
      {/* Response Delay */}
      <div className="mb-6">
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-navy-500">
            Response Delay
          </label>
          <Clock className="ml-2 h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={stub.response.fixedDelayMilliseconds || 0}
            onChange={handleDelayChange}
            className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="60000"
            value={stub.response.fixedDelayMilliseconds || 0}
            onChange={handleDelayChange}
            className="ml-4 w-24 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          <span className="ml-2 text-sm text-gray-500">ms</span>
        </div>
      </div>
      
      {/* Fault Simulation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-navy-500">
            Fault Simulation
          </label>
          <button 
            type="button" 
            onClick={() => setShowFaultHelp(!showFaultHelp)}
            className="text-gray-400 hover:text-navy-500"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        
        {showFaultHelp && (
          <div className="mb-4 p-3 bg-navy-50 rounded-md text-sm text-navy-700">
            <p><strong>CONNECTION_RESET_BY_PEER</strong>: Abruptly closes the connection</p>
            <p><strong>EMPTY_RESPONSE</strong>: Returns no content</p>
            <p><strong>MALFORMED_RESPONSE_CHUNK</strong>: Sends malformed HTTP response</p>
            <p><strong>RANDOM_DATA_THEN_CLOSE</strong>: Sends random bytes then closes</p>
          </div>
        )}
        
        <div className="flex items-center">
          <select
            value={stub.response.fault || 'none'}
            onChange={handleFaultChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="none">No Fault (Normal Response)</option>
            <option value="CONNECTION_RESET_BY_PEER">CONNECTION_RESET_BY_PEER</option>
            <option value="EMPTY_RESPONSE">EMPTY_RESPONSE</option>
            <option value="MALFORMED_RESPONSE_CHUNK">MALFORMED_RESPONSE_CHUNK</option>
            <option value="RANDOM_DATA_THEN_CLOSE">RANDOM_DATA_THEN_CLOSE</option>
          </select>
        </div>
        
        {stub.response.fault && (
          <div className="mt-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-secondary-500 mr-2" />
            <span className="text-sm text-secondary-700">
              Fault simulation is active. This will simulate a failure scenario.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseConfig;