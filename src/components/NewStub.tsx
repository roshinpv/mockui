import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';

interface NewStubProps {
  onSave: (stub: any) => void;
  onCancel: () => void;
}

const NewStub: React.FC<NewStubProps> = ({ onSave, onCancel }) => {
  const [stub, setStub] = useState({
    name: '',
    description: '',
    method: 'GET',
    path: '',
    response: {
      status: 200,
      body: '',
      headers: {},
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(stub);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 bg-green-50">
        <h3 className="text-lg font-semibold text-green-800">Create New Stub</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="name" className="block text-sm font-medium text-neutral-900">
              Stub Name
            </label>
            <input
              type="text"
              id="name"
              value={stub.name}
              onChange={(e) => setStub({ ...stub, name: e.target.value })}
              className="form-control"
              placeholder="Enter stub name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-900">
              Description
            </label>
            <textarea
              id="description"
              value={stub.description}
              onChange={(e) => setStub({ ...stub, description: e.target.value })}
              className="form-control"
              placeholder="Enter stub description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="method" className="block text-sm font-medium text-neutral-900">
                HTTP Method
              </label>
              <select
                id="method"
                value={stub.method}
                onChange={(e) => setStub({ ...stub, method: e.target.value })}
                className="form-control"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="path" className="block text-sm font-medium text-neutral-900">
                Path
              </label>
              <input
                type="text"
                id="path"
                value={stub.path}
                onChange={(e) => setStub({ ...stub, path: e.target.value })}
                className="form-control"
                placeholder="/api/endpoint"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status" className="block text-sm font-medium text-neutral-900">
              Response Status
            </label>
            <input
              type="number"
              id="status"
              value={stub.response.status}
              onChange={(e) => setStub({
                ...stub,
                response: { ...stub.response, status: parseInt(e.target.value) }
              })}
              className="form-control"
              min="100"
              max="599"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body" className="block text-sm font-medium text-neutral-900">
              Response Body
            </label>
            <textarea
              id="body"
              value={stub.response.body}
              onChange={(e) => setStub({
                ...stub,
                response: { ...stub.response, body: e.target.value }
              })}
              className="form-control font-mono"
              placeholder="Enter JSON response body"
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Create Stub
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewStub; 