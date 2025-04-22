import React, { useEffect, useState } from 'react';
import { GitBranch, RefreshCw, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { getScenarios, updateScenario, resetScenarios } from '../services/api';
import { ScenarioState } from '../types/scenario';

const ScenarioManager: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [newState, setNewState] = useState<string>('');

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await getScenarios();
      setScenarios(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch scenarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetScenarios = async () => {
    try {
      setIsResetting(true);
      await resetScenarios();
      await fetchScenarios();
      setError(null);
    } catch (err) {
      setError('Failed to reset scenarios');
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateState = async () => {
    if (!selectedScenario || !newState) return;
    
    try {
      setLoading(true);
      await updateScenario(selectedScenario, newState);
      await fetchScenarios();
      setSelectedScenario(null);
      setNewState('');
      setError(null);
    } catch (err) {
      setError('Failed to update scenario state');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Scenario Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the state of stateful scenarios
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchScenarios}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleResetScenarios}
            disabled={isResetting || scenarios.length === 0}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              (isResetting || scenarios.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isResetting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Scenarios
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scenarios Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-sm text-gray-500">Loading scenarios...</p>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scenarios found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No stateful scenarios have been defined yet
            </p>
            <p className="mt-4 text-sm text-gray-500">
              To create a scenario, add stubs with the scenario field set
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scenario Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current State
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Possible States
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scenarios.map((scenario) => (
                  <tr key={scenario.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GitBranch className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {scenario.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {scenario.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {scenario.possibleStates.map((state, idx) => (
                          <span key={idx} className="mr-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                            {state}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedScenario(scenario.id);
                          setNewState('');
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Change State
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* State Change Dialog */}
      {selectedScenario && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <GitBranch className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Change Scenario State
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {scenarios.find(s => s.id === selectedScenario)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="flex items-center mb-4">
                  <div className="px-3 py-1.5 bg-gray-100 rounded text-sm">
                    {scenarios.find(s => s.id === selectedScenario)?.state}
                  </div>
                  <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="New state"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {scenarios
                    .find(s => s.id === selectedScenario)
                    ?.possibleStates.map((state, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewState(state)}
                        className="inline-flex justify-center items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {state}
                      </button>
                    ))}
                </div>

                <div className="sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    onClick={handleUpdateState}
                    disabled={!newState}
                  >
                    Update State
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setSelectedScenario(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioManager;