import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Code, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  GitBranch,
  Sliders,
  Play,
  RefreshCw,
  Server
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GraphQLStub, defaultGraphQLStub } from '../types/graphql';
import { getGraphQLStubById, createGraphQLStub, updateGraphQLStub } from '../services/graphql-api';

const GraphQLStubEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [stub, setStub] = useState<GraphQLStub>(defaultGraphQLStub);
  const [activeTab, setActiveTab] = useState('operation');
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [executeResponse, setExecuteResponse] = useState<{status: number, body: string, headers: Record<string, string>} | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch existing stub if editing
  const { data: existingStub } = useQuery({
    queryKey: ['graphql-stub', id],
    queryFn: () => getGraphQLStubById(id!),
    enabled: !!id && id !== 'new'
  });

  // Mutations for creating/updating stubs
  const createMutation = useMutation({
    mutationFn: createGraphQLStub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graphql-stubs'] });
      navigate('/graphql-stubs');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (stub: GraphQLStub) => updateGraphQLStub(stub.id, stub),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graphql-stubs'] });
      navigate('/graphql-stubs');
    }
  });

  useEffect(() => {
    if (existingStub) {
      setStub(existingStub);
    }
  }, [existingStub]);

  const handleChange = (field: string, value: any) => {
    setStub(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleToggleEnabled = () => {
    handleChange('enabled', !stub.enabled);
  };

  const validateStub = (): string[] => {
    const errors: string[] = [];
    
    // Basic validations for required fields
    if (!stub.name) errors.push('Name is required');
    if (!stub.operationName) errors.push('Operation name is required');
    if (!stub.query) errors.push('Query is required');
    if (!stub.response) errors.push('Response is required');
    
    // GraphQL query structure validation
    const queryLowerCase = stub.query?.toLowerCase() || '';
    if (queryLowerCase && 
        !queryLowerCase.includes('query') && 
        !queryLowerCase.includes('mutation') && 
        !queryLowerCase.includes('subscription')) {
      errors.push('GraphQL query must include a query, mutation, or subscription declaration');
    }
    
    // Response JSON validation
    try {
      if (stub.response) {
        const responseObj = JSON.parse(stub.response);
        // Check for valid GraphQL response structure
        if (!responseObj.data && !responseObj.errors) {
          errors.push('Response must include either "data" or "errors" field');
        }
      }
    } catch (e) {
      errors.push('Response must be valid JSON');
    }

    // Variables JSON validation
    if (stub.variables) {
      try {
        JSON.parse(stub.variables);
      } catch (e) {
        errors.push('Variables must be valid JSON');
      }
    }
    
    // Scenario validation
    if (stub.scenarioName && (!stub.requiredScenarioState && !stub.newScenarioState)) {
      errors.push('When using scenarios, you must specify either a required state or a new state');
    }
    
    // Priority validation
    if (stub.priority !== undefined && (typeof stub.priority !== 'number' || stub.priority < 0)) {
      errors.push('Priority must be a non-negative number');
    }

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateStub();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (id && id !== 'new') {
        await updateMutation.mutateAsync(stub);
      } else {
        await createMutation.mutateAsync(stub);
      }
      setIsDirty(false);
      navigate('/graphql-stubs');
    } catch (err: any) {
      // Enhanced error handling for API failures
      if (err.response && err.response.data) {
        setErrors([`Server error: ${err.response.data.error || err.response.data.message || 'Unknown server error'}`]);
      } else {
        setErrors([`Failed to save GraphQL stub: ${err.message || 'Unknown error'}`]);
      }
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecuteResponse(null);
    
    try {
      // Prepare variables
      let variables = {};
      if (stub.variables) {
        try {
          variables = JSON.parse(stub.variables);
        } catch (e) {
          setErrors(['Variables must be valid JSON']);
          setIsExecuting(false);
          return;
        }
      }

      // Prepare the GraphQL request
      const graphqlRequest = {
        query: stub.query,
        operationName: stub.operationName,
        variables
      };

      // Execute the request
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlRequest),
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
      setErrors([`Failed to execute GraphQL stub: ${err instanceof Error ? err.message : String(err)}`]);
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
            onClick={() => navigate('/graphql-stubs')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-navy-500">
              {id === 'new' ? 'Create New GraphQL Stub' : 'Edit GraphQL Stub'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Define how your mock GraphQL API should respond
            </p>
          </div>
        </div>
        <div className="flex space-x-3 items-center">
          <button
            type="button"
            onClick={handleToggleEnabled}
            className="flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
        <div className="bg-red-50 border-l-4 border-primary-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-primary-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">
                Please fix the following errors:
              </h3>
              <ul className="mt-1 text-sm text-primary-700 list-disc list-inside">
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
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter a descriptive name"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('operation')}
            className={`${
              activeTab === 'operation'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Code className="h-4 w-4 mr-2" />
            Operation
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`${
              activeTab === 'scenarios'
                ? 'border-brand-500 text-brand-600'
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
                ? 'border-brand-500 text-brand-600'
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
        {activeTab === 'operation' && (
          <div className="p-6">
            {/* Operation Name */}
            <div className="mb-6">
              <label htmlFor="operationName" className="block text-sm font-medium text-navy-500">
                Operation Name
              </label>
              <input
                type="text"
                id="operationName"
                value={stub.operationName}
                onChange={(e) => handleChange('operationName', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., GetUser"
              />
            </div>

            {/* Query */}
            <div className="mb-6">
              <label htmlFor="query" className="block text-sm font-medium text-navy-500">
                GraphQL Query
              </label>
              <textarea
                id="query"
                value={stub.query}
                onChange={(e) => handleChange('query', e.target.value)}
                rows={8}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                placeholder={`query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}`}
              />
            </div>

            {/* Variables */}
            <div className="mb-6">
              <label htmlFor="variables" className="block text-sm font-medium text-navy-500">
                Variables (Optional)
              </label>
              <textarea
                id="variables"
                value={stub.variables}
                onChange={(e) => handleChange('variables', e.target.value)}
                rows={4}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                placeholder={`{
  "id": "123"
}`}
              />
            </div>

            {/* Response */}
            <div>
              <label htmlFor="response" className="block text-sm font-medium text-navy-500">
                Response
              </label>
              <textarea
                id="response"
                value={stub.response}
                onChange={(e) => handleChange('response', e.target.value)}
                rows={8}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                placeholder={`{
  "data": {
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}`}
              />
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="p-6">
            {/* Scenario Name */}
            <div className="mb-6">
              <label htmlFor="scenarioName" className="block text-sm font-medium text-navy-500">
                Scenario Name
              </label>
              <input
                type="text"
                id="scenarioName"
                value={stub.scenarioName || ''}
                onChange={(e) => handleChange('scenarioName', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., UserFlow"
              />
            </div>

            {/* Required State */}
            <div className="mb-6">
              <label htmlFor="requiredState" className="block text-sm font-medium text-navy-500">
                Required State
              </label>
              <input
                type="text"
                id="requiredState"
                value={stub.requiredScenarioState || ''}
                onChange={(e) => handleChange('requiredScenarioState', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., LoggedIn"
              />
            </div>

            {/* New State */}
            <div>
              <label htmlFor="newState" className="block text-sm font-medium text-navy-500">
                New State
              </label>
              <input
                type="text"
                id="newState"
                value={stub.newScenarioState || ''}
                onChange={(e) => handleChange('newScenarioState', e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., ProfileUpdated"
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="p-6">
            {/* Priority */}
            <div className="mb-6">
              <label htmlFor="priority" className="block text-sm font-medium text-navy-500">
                Matching Priority
              </label>
              <input
                type="number"
                id="priority"
                value={stub.priority || ''}
                onChange={(e) => handleChange('priority', e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1 block w-32 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Higher priority stubs are matched first
              </p>
            </div>

            {/* Persistent */}
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="persistent"
                  type="checkbox"
                  checked={stub.persistent || false}
                  onChange={(e) => handleChange('persistent', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="persistent" className="ml-2 block text-sm text-gray-900">
                  Persist this stub
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                When enabled, this stub will be saved and loaded on restart
              </p>
            </div>

            {/* Metadata */}
            <div>
              <label htmlFor="metadata" className="block text-sm font-medium text-navy-500">
                Metadata
              </label>
              <textarea
                id="metadata"
                value={stub.metadata ? JSON.stringify(stub.metadata, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const metadata = e.target.value ? JSON.parse(e.target.value) : undefined;
                    handleChange('metadata', metadata);
                  } catch (err) {
                    // Ignore invalid JSON
                  }
                }}
                rows={4}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-mono"
                placeholder='{"tags": ["graphql", "user"], "version": "1.0"}'
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional JSON metadata for organization or custom integrations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphQLStubEditor;