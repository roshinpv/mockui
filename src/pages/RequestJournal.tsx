import React, { useEffect, useState } from 'react';
import { Clock, Search, RefreshCw, Download, Trash2, Code, X, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { getRequests, clearRequests } from '../services/api';
import { RequestLog } from '../types/request';

const RequestJournal: React.FC = () => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch request logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearRequests = async () => {
    try {
      setLoading(true);
      await clearRequests();
      setRequests([]);
      setSelectedRequest(null);
      setShowDetails(false);
      setError(null);
    } catch (err) {
      setError('Failed to clear request logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (request: RequestLog) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredRequests = requests
    .filter(request => {
      const matchesSearch = 
        request.request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.request.method.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMethod = filterMethod ? request.request.method === filterMethod : true;
      const matchesStatus = filterStatus ? 
        (request.responseDefinition.status.toString().startsWith(filterStatus)) : true;
      
      return matchesSearch && matchesMethod && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by timestamp
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800';
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Request Journal</h1>
          <p className="mt-1 text-sm text-gray-500">
            View logs of all incoming API requests and responses
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchRequests}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleClearRequests}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Journal
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search requests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>

          <div>
            <select
              id="method"
              name="method"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status Codes</option>
              <option value="2">2xx - Success</option>
              <option value="3">3xx - Redirect</option>
              <option value="4">4xx - Client Error</option>
              <option value="5">5xx - Server Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {requests.length === 0 
                ? 'No API requests have been recorded yet' 
                : 'No requests match your search criteria'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Filter className="h-4 w-4 text-gray-400" />
                <span>
                  Showing <span className="font-medium">{filteredRequests.length}</span> of{' '}
                  <span className="font-medium">{requests.length}</span> requests
                </span>
              </div>
              <button 
                onClick={toggleSortOrder}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Clock className="h-4 w-4 mr-1" />
                {sortOrder === 'desc' ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
              </button>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <li 
                  key={request.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedRequest?.id === request.id ? 'bg-indigo-50' : ''}`}
                  onClick={() => handleSelectRequest(request)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMethodColor(request.request.method)}`}>
                          {request.request.method}
                        </span>
                        <p className="ml-2 text-sm font-medium text-gray-900 truncate">
                          {request.request.url}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.responseDefinition.status)}`}>
                          {request.responseDefinition.status}
                        </span>
                        {!request.wasMatched && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            No Match
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {request.stubMapping && (
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="truncate">Matched Stub: {request.stubMapping}</span>
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {formatTimestamp(request.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Request Details Sidebar */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-y-0 right-0 max-w-full flex z-40">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
              <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Request Details
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close panel</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 relative flex-1 px-4 sm:px-6">
                {/* Request Info */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Request Information</h3>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-sm mb-1">
                      <span className="font-medium">Method:</span>{' '}
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getMethodColor(selectedRequest.request.method)}`}>
                        {selectedRequest.request.method}
                      </span>
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">URL:</span>{' '}
                      <span className="text-gray-700 break-all">{selectedRequest.request.url}</span>
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Timestamp:</span>{' '}
                      <span className="text-gray-700">{formatTimestamp(selectedRequest.timestamp)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Matched:</span>{' '}
                      <span className={`${selectedRequest.wasMatched ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedRequest.wasMatched ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Headers */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Request Headers</h3>
                  <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                    {Object.entries(selectedRequest.request.headers).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No headers</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {Object.entries(selectedRequest.request.headers).map(([key, values]) => (
                          <li key={key} className="py-1">
                            <p className="text-xs">
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="text-gray-700">{values.join(', ')}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Query Parameters */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Query Parameters</h3>
                  <div className="bg-gray-50 rounded-md p-3">
                    {Object.entries(selectedRequest.request.queryParams).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No query parameters</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {Object.entries(selectedRequest.request.queryParams).map(([key, values]) => (
                          <li key={key} className="py-1">
                            <p className="text-xs">
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="text-gray-700">{values.join(', ')}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Request Body */}
                {selectedRequest.request.body && (
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Request Body</h3>
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="overflow-x-auto">
                        <pre className="text-xs text-gray-700">{selectedRequest.request.body}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Response */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Response</h3>
                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-sm mb-2">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.responseDefinition.status)}`}>
                        {selectedRequest.responseDefinition.status}
                      </span>
                    </p>
                    {selectedRequest.responseDefinition.body && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Body:</p>
                        <div className="overflow-x-auto bg-gray-100 rounded p-2">
                          <pre className="text-xs text-gray-700">{selectedRequest.responseDefinition.body}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestJournal;