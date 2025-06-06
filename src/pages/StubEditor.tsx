import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Code, 
  Server, 
  AlertTriangle, 
  Sliders, 
  GitBranch, 
  Globe, 
  FileJson,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Play
} from 'lucide-react';
import { useStubs } from '../context/StubContext';
import { Stub, defaultStub } from '../types/stub';
import RequestConfig from '../components/stub-editor/RequestConfig';
import ResponseConfig from '../components/stub-editor/ResponseConfig';
import ScenarioConfig from '../components/stub-editor/ScenarioConfig';
import AdvancedConfig from '../components/stub-editor/AdvancedConfig';

const StubEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStubById, addStub, updateStub } = useStubs();
  
  const [stub, setStub] = useState<Stub>(defaultStub);
  const [activeTab, setActiveTab] = useState('request');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [executeResponse, setExecuteResponse] = useState<{status: number, body: string, headers: Record<string, string>} | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      const existingStub = getStubById(id);
      if (existingStub) {
        setStub(existingStub);
        setJsonValue(JSON.stringify(existingStub, null, 2));
      } else {
        navigate('/stubs/new');
      }
    } else {
      setStub({ ...defaultStub, id: '' });
      setJsonValue(JSON.stringify(defaultStub, null, 2));
    }
  }, [id, getStubById, navigate]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonValue(e.target.value);
    setIsDirty(true);
    
    try {
      JSON.parse(e.target.value);
      setErrors([]);
    } catch (err) {
      setErrors(['Invalid JSON format']);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setStub(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Stub],
          [child]: value
        }
      }));
    } else {
      setStub(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setIsDirty(true);
  };

  const toggleJsonMode = () => {
    if (!jsonMode) {
      // Switching to JSON mode
      setJsonValue(JSON.stringify(stub, null, 2));
    } else {
      // Switching to form mode
      try {
        const parsedStub = JSON.parse(jsonValue);
        setStub(parsedStub);
        setErrors([]);
      } catch (err) {
        setErrors(['Cannot switch to form mode: Invalid JSON format']);
        return; // Prevent switching if JSON is invalid
      }
    }
    setJsonMode(!jsonMode);
  };

  const validateStub = (): string[] => {
    const validationErrors: string[] = [];
    
    // Basic validations
    if (!stub.name) validationErrors.push('Name is required');
    if (!stub.request.method) validationErrors.push('HTTP method is required');
    
    // URL validation - must have one of the URL matching types
    if (!stub.request.urlPath && !stub.request.urlPattern && !stub.request.urlPathPattern && !stub.request.url) {
      validationErrors.push('URL pattern or path is required');
    }
    
    // Response validation
    if (!stub.response.status) validationErrors.push('Response status is required');
    
    // Content type validation for JSON response
    const contentType = stub.response.headers?.['Content-Type'];
    if (contentType?.equalTo?.includes('application/json')) {
      try {
        if (stub.response.body) {
          JSON.parse(stub.response.body);
        }
      } catch (err) {
        validationErrors.push('Response body is not valid JSON');
      }
    }
    
    // Validate query parameters
    if (stub.request.queryParameters) {
      for (const [key, value] of Object.entries(stub.request.queryParameters)) {
        if (!key) validationErrors.push('Query parameter name is required');
        if (!value.equalTo && key) validationErrors.push(`Query parameter '${key}' value is required`);
      }
    }
    
    // Validate headers
    if (stub.request.headers) {
      for (const [key, value] of Object.entries(stub.request.headers)) {
        if (!key) validationErrors.push('Header name is required');
        if (!value.equalTo && key) validationErrors.push(`Header '${key}' value is required`);
      }
    }
    
    return validationErrors;
  };

  const handleSave = async () => {
    try {
      if (jsonMode) {
        try {
          const parsedStub = JSON.parse(jsonValue);
          
          if (!parsedStub.name || !parsedStub.request || !parsedStub.response) {
            setErrors(['Stub must have name, request, and response properties']);
            return;
          }
          
          if (id && id !== 'new') {
            await updateStub(id, parsedStub);
          } else {
            await addStub(parsedStub);
          }
          
          setIsDirty(false);
          navigate('/stubs');
        } catch (err) {
          setErrors(['Invalid JSON format']);
        }
      } else {
        // Form validation using the enhanced validateStub function
        const validationErrors = validateStub();
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }
        
        try {
          if (id && id !== 'new') {
            await updateStub(id, stub);
          } else {
            await addStub(stub);
          }
          
          setIsDirty(false);
          navigate('/stubs');
        } catch (err: any) {
          // Enhanced error handling
          if (err.response && err.response.data) {
            setErrors([`Server error: ${err.response.data.error || err.response.data.message || 'Unknown server error'}`]);
          } else {
            setErrors([`Failed to save stub: ${err.message || 'Unknown error'}`]);
          }
        }
      }
    } catch (err: any) {
      // Fallback error handling
      setErrors([`Error: ${err.message || 'An unexpected error occurred'}`]);
    }
  };

  const handleToggleEnabled = () => {
    handleChange('enabled', !stub.enabled);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecuteResponse(null);
    
    try {
      // Determine the URL to call based on the stub configuration
      let url = '';
      if (stub.request.urlPath) {
        url = `http://localhost:8080${stub.request.urlPath}`;
      } else if (stub.request.url) {
        url = stub.request.url;
      } else if (stub.request.urlPattern || stub.request.urlPathPattern) {
        setErrors(['Cannot execute stubs with URL patterns. Please use a specific URL path.']);
        setIsExecuting(false);
        return;
      }

      // Add query parameters if present
      if (stub.request.queryParameters && Object.keys(stub.request.queryParameters).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(stub.request.queryParameters).forEach(([key, value]) => {
          queryParams.append(key, value.equalTo);
        });
        url += `?${queryParams.toString()}`;
      }

      // Prepare headers
      const headers: Record<string, string> = {};
      if (stub.request.headers) {
        Object.entries(stub.request.headers).forEach(([key, value]) => {
          headers[key] = value.equalTo;
        });
      }

      // Execute the request
      const response = await fetch(url, {
        method: stub.request.method,
        headers,
        body: stub.request.body ? stub.request.body : undefined,
      });

      // Get response data
      const responseData = await response.text();
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setExecuteResponse({
        status: response.status,
        body: responseData,
        headers: responseHeaders,
      });
    } catch (err) {
      setErrors([`Failed to execute stub: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/stubs')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-navy-500">
              {id === 'new' ? 'Create New Stub' : 'Edit Stub'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Define how your mock API should respond
            </p>
          </div>
        </div>
        <div className="flex space-x-3 items-center">
          <button
            type="button"
            onClick={handleToggleEnabled}
            className="flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
          >
            {stub.enabled ? (
              <>
                <ToggleRight className="h-4 w-4 mr-1.5 text-green-500" />
                <span className="text-green-600">Enabled</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-1.5 text-gray-400" />
                <span className="text-gray-500">Disabled</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={toggleJsonMode}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
          >
            <Code className="h-4 w-4 mr-1.5" />
            {jsonMode ? 'Form Mode' : 'JSON Mode'}
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary-500 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExecuting || id === 'new' || !stub.id}
          >
            {isExecuting ? (
              <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1.5" />
            )}
            Execute
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isDirty}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Stub
          </button>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-navy-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-navy-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-navy-800">
                Please fix the following errors:
              </h3>
              <ul className="mt-1 text-sm text-navy-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Execution response */}
      {executeResponse && (
        <div className="bg-brand-50 border-l-4 border-brand-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Server className="h-5 w-5 text-brand-500" />
            </div>
            <div className="ml-3 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-brand-800">
                  Response (Status: {executeResponse.status})
                </h3>
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-medium text-brand-700">Headers:</h4>
                <div className="mt-1 bg-white p-2 rounded text-xs font-mono overflow-x-auto">
                  {Object.entries(executeResponse.headers).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-semibold">{key}:</span> {value}
                    </div>
                  ))}
                </div>
                <h4 className="text-xs font-medium text-brand-700 mt-2">Body:</h4>
                <div className="mt-1 bg-white p-2 rounded text-xs font-mono max-h-40 overflow-auto">
                  <pre>{executeResponse.body}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON Mode */}
      {jsonMode ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
              <FileJson className="h-5 w-5 mr-2 text-gray-500" />
              JSON Editor
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={jsonValue}
              onChange={handleJsonChange}
              className="w-full h-[70vh] font-mono text-sm p-4 border border-gray-300 rounded-md focus:ring-navy-500 focus:border-navy-500"
              placeholder="Enter valid JSON for the stub configuration"
            />
          </div>
        </div>
      ) : (
        /* Form Mode */
        <div>
          {/* Name input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-navy-500">
              Stub Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={stub.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-navy-500 focus:border-navy-500"
              placeholder="Enter a descriptive name"
            />
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab('request')}
                className={`${
                  activeTab === 'request'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Globe className="h-4 w-4 mr-2" />
                Request Matching
              </button>
              <button
                onClick={() => setActiveTab('response')}
                className={`${
                  activeTab === 'response'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Server className="h-4 w-4 mr-2" />
                Response
              </button>
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`${
                  activeTab === 'scenarios'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Scenarios
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`${
                  activeTab === 'advanced'
                    ? 'border-navy-500 text-navy-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Sliders className="h-4 w-4 mr-2" />
                Advanced
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {activeTab === 'request' && (
              <RequestConfig stub={stub} onChange={handleChange} />
            )}
            {activeTab === 'response' && (
              <ResponseConfig stub={stub} onChange={handleChange} />
            )}
            {activeTab === 'scenarios' && (
              <ScenarioConfig stub={stub} onChange={handleChange} />
            )}
            {activeTab === 'advanced' && (
              <AdvancedConfig stub={stub} onChange={handleChange} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StubEditor;