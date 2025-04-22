import React, { useState } from 'react';
import { GitBranch, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { Stub } from '../../types/stub';

interface ScenarioConfigProps {
  stub: Stub;
  onChange: (field: string, value: any) => void;
}

const ScenarioConfig: React.FC<ScenarioConfigProps> = ({ stub, onChange }) => {
  const [showScenarioHelp, setShowScenarioHelp] = useState(false);
  const [scenarioName, setScenarioName] = useState(stub.scenario?.name || '');
  const [requiredState, setRequiredState] = useState(stub.requiredScenarioState || '');
  const [newState, setNewState] = useState(stub.newScenarioState || '');

  const handleScenarioNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setScenarioName(name);
    
    if (name) {
      onChange('scenario', { name, state: stub.scenario?.state || undefined });
    } else {
      // Remove scenario if name is empty
      const { scenario, requiredScenarioState, newScenarioState, ...stubWithoutScenario } = stub;
      onChange('', { ...stubWithoutScenario });
      setRequiredState('');
      setNewState('');
    }
  };

  const handleRequiredStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const state = e.target.value;
    setRequiredState(state);
    onChange('requiredScenarioState', state || undefined);
  };

  const handleNewStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const state = e.target.value;
    setNewState(state);
    onChange('newScenarioState', state || undefined);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Stateful Scenario Configuration</h3>
        <button 
          type="button" 
          onClick={() => setShowScenarioHelp(!showScenarioHelp)}
          className="text-gray-400 hover:text-gray-500"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
      
      {showScenarioHelp && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How Scenarios Work</h4>
          <p className="text-sm text-blue-700 mb-2">
            Scenarios allow you to create stateful mocks where responses change based on previous requests.
          </p>
          <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
            <li>Assign a scenario name to group related stubs</li>
            <li>Set a required state for this stub to match (e.g., "Started")</li>
            <li>Define a new state to transition to after this stub is matched (e.g., "Payment Received")</li>
            <li>Create different responses for each state of your scenario</li>
          </ul>
          <p className="text-sm text-blue-700 mt-2">
            Example: Create a sequence of responses for an order process: Started → Payment Received → Shipped → Delivered
          </p>
        </div>
      )}
      
      {!scenarioName && (
        <div className="flex items-start mb-6">
          <div className="flex-shrink-0 mt-1">
            <GitBranch className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Scenarios are currently disabled</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                Enable scenarios to create stateful mock behaviors where responses change based on previous requests.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Scenario Name */}
      <div className="mb-6">
        <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
          Scenario Name
        </label>
        <input
          type="text"
          id="scenarioName"
          value={scenarioName}
          onChange={handleScenarioNameChange}
          className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Order Process"
        />
        <p className="mt-1 text-xs text-gray-500">
          Give your scenario a descriptive name to group related stubs
        </p>
      </div>
      
      {scenarioName && (
        <>
          {/* Required State */}
          <div className="mb-6">
            <label htmlFor="requiredState" className="block text-sm font-medium text-gray-700 mb-1">
              Required State
            </label>
            <input
              type="text"
              id="requiredState"
              value={requiredState}
              onChange={handleRequiredStateChange}
              className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Started"
            />
            <p className="mt-1 text-xs text-gray-500">
              This stub will only match when the scenario is in this state
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to match when no previous requests have been made (scenario start)
            </p>
          </div>
          
          {/* Transition Visualization */}
          <div className="mb-6 flex items-center justify-center">
            <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
              {requiredState || 'Start'}
            </div>
            <ArrowRight className="mx-4 h-5 w-5 text-gray-400" />
            <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
              {newState || '(No change)'}
            </div>
          </div>
          
          {/* New State */}
          <div className="mb-6">
            <label htmlFor="newState" className="block text-sm font-medium text-gray-700 mb-1">
              New State
            </label>
            <input
              type="text"
              id="newState"
              value={newState}
              onChange={handleNewStateChange}
              className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Payment Received"
            />
            <p className="mt-1 text-xs text-gray-500">
              The scenario will transition to this state when this stub is matched
            </p>
          </div>
          
          {/* Info Box */}
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important notes about scenarios</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All scenarios start with no state (null) by default</li>
                    <li>Create multiple stubs with the same scenario name but different states</li>
                    <li>Scenarios persist until manually reset or the server restarts</li>
                    <li>You can reset all scenarios from the Scenarios management page</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScenarioConfig;