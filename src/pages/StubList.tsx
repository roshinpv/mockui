import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search, X, AlertTriangle, Filter } from 'lucide-react';
import { useStubs } from '../context/StubContext';
import { Stub } from '../types/stub';

const StubList: React.FC = () => {
  const { stubs, loading, error, removeStub } = useStubs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [showingConfirmDelete, setShowingConfirmDelete] = useState<string | null>(null);

  // Helper function to check if the request has urlPath or urlPattern
  const getRequestUrl = (request: any): string => {
    if (typeof request === 'object') {
      return request.urlPath || request.urlPattern || '/';
    }
    return '/';
  };

  // Helper function to get the request method
  const getRequestMethod = (request: any): string => {
    if (typeof request === 'object' && request.method) {
      return request.method;
    }
    return 'UNKNOWN';
  };

  // Helper function to get response status
  const getResponseStatus = (response: any): number | null => {
    if (typeof response === 'object' && response.status) {
      return response.status;
    }
    return null;
  };

  // Filter stubs based on search term and method
  const filteredStubs = stubs.filter(stub => {
    const matchesSearch = stub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          getRequestUrl(stub.request).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = !filterMethod || getRequestMethod(stub.request) === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  const handleDelete = async (id: string) => {
    if (showingConfirmDelete === id) {
      await removeStub(id);
      setShowingConfirmDelete(null);
    } else {
      setShowingConfirmDelete(id);
    }
  };

  const cancelDelete = () => {
    setShowingConfirmDelete(null);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'POST':
        return 'bg-brand-100 text-brand-700 border border-brand-200';
      case 'PUT':
        return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
      case 'DELETE':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'PATCH':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border border-neutral-200';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-brand-500 mr-2" />
            <p className="text-sm text-brand-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">HTTP Stubs</h1>
        <p className="section-description">
          Manage your API mocks and stubs
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="form-grid">
            <div className="relative">
              <div className="input-group">
                <div className="input-group-prepend">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search stubs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="input-group-append">
                    <button 
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="custom-select">
              <select
                id="method"
                name="method"
                className="form-control"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                aria-label="Filter by method"
              >
                <option value="">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {filteredStubs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-neutral-500">No stubs found matching your criteria</p>
              <Link
                to="/stubs/new"
                className="btn-secondary mt-4"
              >
                Create a new stub
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Method</th>
                    <th className="hidden sm:table-cell">Path</th>
                    <th className="hidden md:table-cell">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStubs.map((stub) => (
                    <tr key={stub.id}>
                      <td className="max-w-xs truncate">
                        <p className={`text-sm font-medium ${stub.enabled ? 'text-brand-600' : 'text-neutral-500'}`}>
                          {stub.name}
                        </p>
                        <span className="text-xs text-neutral-500 sm:hidden">
                          {getRequestUrl(stub.request)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getMethodBadgeClass(getRequestMethod(stub.request))}`}>
                          {getRequestMethod(stub.request)}
                        </span>
                      </td>
                      <td className="max-w-xs truncate hidden sm:table-cell">
                        <span className="text-sm text-neutral-600">
                          {getRequestUrl(stub.request)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        <div className="flex items-center space-x-1">
                          {getResponseStatus(stub.response) && (
                            <span className={`status-badge ${
                              (getResponseStatus(stub.response) as number) >= 200 && (getResponseStatus(stub.response) as number) < 300 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : (getResponseStatus(stub.response) as number) >= 400 
                                  ? 'bg-brand-100 text-brand-700 border border-brand-200' 
                                  : 'bg-secondary-100 text-secondary-800 border border-secondary-200'
                            }`}>
                              {getResponseStatus(stub.response)}
                            </span>
                          )}
                          {stub.scenario && (
                            <span className="status-badge bg-brand-100 text-brand-700 border border-brand-200">
                              S
                            </span>
                          )}
                          {!stub.enabled && (
                            <span className="status-badge bg-neutral-100 text-neutral-700 border border-neutral-200">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/stubs/${stub.id}`}
                            className="btn-secondary btn-sm !p-1.5"
                            aria-label="Edit stub"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(stub.id)}
                            className="btn-danger btn-sm !p-1.5"
                            aria-label="Delete stub"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {showingConfirmDelete === stub.id && (
                          <div className="mt-2 flex items-center justify-end space-x-2">
                            <span className="text-xs text-brand-500">Confirm?</span>
                            <button
                              onClick={() => handleDelete(stub.id)}
                              className="btn-danger btn-sm !p-1"
                            >
                              Yes
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="btn-secondary btn-sm !p-1"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-sm text-neutral-500 order-2 sm:order-1">
            {filteredStubs.length} {filteredStubs.length === 1 ? 'stub' : 'stubs'} found
          </span>
          <Link 
            to="/stubs/new" 
            className="btn-primary order-1 sm:order-2 w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Stub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StubList;