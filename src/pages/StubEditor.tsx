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
  ToggleRight
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
        // Form validation
        const validationErrors = [];
        
        if (!stub.name) validationErrors.push('Name is required');
        if (!stub.request.method) validationErrors.push('HTTP method is required');
        if (!stub.request.urlPath && !stub.request.urlPattern && !stub.request.urlPathPattern) {
          validationErrors.push('URL pattern or path is required');
        }
        if (!stub.response.status) validationErrors.push('Response status is required');
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }
        
        if (id && id !== 'new') {
          await updateStub(id, stub);
        } else {
          await addStub(stub);
        }
        
        setIsDirty(false);
        navigate('/stubs');
      }
    } catch (err) {
      setErrors(['Failed to save stub']);
    }
  };

  const handleToggleEnabled = () => {
    handleChange('enabled', !stub.enabled);
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