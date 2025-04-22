import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search, X, AlertTriangle, FileJson } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSoapStubs, deleteSoapStub } from '../services/soap-api';
import { SoapStub } from '../types/soap';

const SoapStubList: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showingConfirmDelete, setShowingConfirmDelete] = useState<string | null>(null);

  const { data: stubs = [], isLoading, error } = useQuery({
    queryKey: ['soap-stubs'],
    queryFn: getSoapStubs
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSoapStub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soap-stubs'] });
    }
  });

  const handleDelete = async (id: string) => {
    if (showingConfirmDelete === id) {
      await deleteMutation.mutateAsync(id);
      setShowingConfirmDelete(null);
    } else {
      setShowingConfirmDelete(id);
    }
  };

  const filteredStubs = stubs.filter(stub => 
    stub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stub.soapAction?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
            <p className="text-sm text-brand-700">Failed to load SOAP stubs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">SOAP Stubs</h1>
        <p className="section-description">
          Manage your SOAP API mocks
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="w-full sm:max-w-md">
              <div className="input-group">
                <div className="input-group-prepend">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search SOAP stubs"
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
            <Link 
              to="/soap-stubs/new" 
              className="btn-primary w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New SOAP Stub
            </Link>
          </div>
        </div>

        <div className="card-body p-0">
          {filteredStubs.length === 0 ? (
            <div className="text-center py-12">
              <FileJson className="mx-auto h-10 w-10 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500">No SOAP stubs found</p>
              <Link
                to="/soap-stubs/new"
                className="btn-secondary mt-4"
              >
                Create a new SOAP stub
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SOAP Action</th>
                    <th className="hidden md:table-cell">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStubs.map((stub) => (
                    <tr key={stub.id}>
                      <td>
                        <div className="flex flex-col">
                          <p className={`text-sm font-medium ${stub.enabled ? 'text-brand-600' : 'text-neutral-500'} truncate`}>
                            {stub.name}
                          </p>
                          <span className="text-xs text-neutral-500 md:hidden">
                            {!stub.enabled && "Disabled"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge bg-brand-100 text-brand-800 border border-brand-200">
                          {stub.soapAction || 'No Action'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        {!stub.enabled && (
                          <span className="status-badge bg-neutral-100 text-neutral-800 border border-neutral-200">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/soap-stubs/${stub.id}`}
                            className="btn-secondary btn-sm !p-1.5"
                            aria-label="Edit SOAP stub"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(stub.id)}
                            className="btn-danger btn-sm !p-1.5"
                            aria-label="Delete SOAP stub"
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
                              onClick={() => setShowingConfirmDelete(null)}
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
      </div>
    </div>
  );
};

export default SoapStubList;