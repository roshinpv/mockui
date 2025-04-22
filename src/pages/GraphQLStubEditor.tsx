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
  Sliders
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
    
    if (!stub.name) errors.push('Name is required');
    if (!stub.operationName) errors.push('Operation name is required');
    if (!stub.query) errors.push('Query is required');
    if (!stub.response) errors.push('Response is required');
    
    try {
      if (stub.response) JSON.parse(stub.response);
    } catch (e) {
      errors.push('Response must be valid JSON');
    }

    if (stub.variables) {
      try {
        JSON.parse(stub.variables);
      } catch (e) {
        errors.push('Variables must be valid JSON');
      }
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
    } catch (err) {
      setErrors(['Failed to save GraphQL stub']);
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
            onClick={handleSave}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                ? 'border-primary-500 text-primary-600'
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
                ? 'border-primary-500 text-primary-600'
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
                ? 'border-primary-500 text-primary-600'
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