import React, { useState } from 'react';
import { Sliders, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Stub, BodyPattern } from '../../types/stub';

interface AdvancedConfigProps {
  stub: Stub;
  onChange: (field: string, value: any) => void;
}

const AdvancedConfig: React.FC<AdvancedConfigProps> = ({ stub, onChange }) => {
  const [showBodyPatternHelp, setShowBodyPatternHelp] = useState(false);
  const [bodyPatternType, setBodyPatternType] = useState<string>('equalToJson');
  const [bodyPatternValue, setBodyPatternValue] = useState<string>('');
  
  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onChange('priority', value);
  };

  const handlePersistentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('persistent', e.target.checked);
  };

  const addBodyPattern = () => {
    if (!bodyPatternValue) return;
    
    const newPattern: BodyPattern = {
      [bodyPatternType]: bodyPatternValue
    };
    
    const bodyPatterns = [...(stub.request.bodyPatterns || []), newPattern];
    onChange('request.bodyPatterns', bodyPatterns);
    
    setBodyPatternValue('');
  };

  const removeBodyPattern = (index: number) => {
    const bodyPatterns = [...(stub.request.bodyPatterns || [])];
    bodyPatterns.splice(index, 1);
    onChange('request.bodyPatterns', bodyPatterns);
  };

  const getBodyPatternLabel = (pattern: BodyPattern): string => {
    const type = Object.keys(pattern)[0];
    const value = pattern[type as keyof BodyPattern];
    
    switch (type) {
      case 'equalToJson':
        return `JSON equals: ${truncate(value as string, 40)}`;
      case 'matchesJsonPath':
        return `JSONPath: ${value}`;
      case 'equalTo':
        return `Equals: ${truncate(value as string, 40)}`;
      case 'contains':
        return `Contains: ${truncate(value as string, 40)}`;
      case 'matches':
        return `Regex: ${value}`;
      case 'matchesXPath':
        return `XPath: ${value}`;
      default:
        return `${type}: ${truncate(String(value), 40)}`;
    }
  };

  const truncate = (str: string, length: number): string => {
    return str.length > length ? str.slice(0, length) + '...' : str;
  };

  const getPatternTypePlaceholder = (): string => {
    switch (bodyPatternType) {
      case 'equalToJson':
        return '{"name": "test", "value": 123}';
      case 'matchesJsonPath':
        return '$.store.book[?(@.price < 10)]';
      case 'equalTo':
        return 'Exact body content';
      case 'contains':
        return 'Text that body should contain';
      case 'matches':
        return '.*\\d{3}.*';
      case 'matchesXPath':
        return '//book/author';
      default:
        return '';
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Advanced Configuration</h3>
      
      {/* Priority */}
      <div className="mb-6">
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Matching Priority
        </label>
        <input
          type="number"
          id="priority"
          value={stub.priority !== undefined ? stub.priority : ''}
          onChange={handlePriorityChange}
          className="w-32 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="1"
        />
        <p className="mt-1 text-xs text-gray-500">
          When multiple stubs match, higher priority stubs are used first
        </p>
      </div>
      
      {/* Persistent */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            id="persistent"
            type="checkbox"
            checked={stub.persistent || false}
            onChange={handlePersistentChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="persistent" className="ml-2 block text-sm text-gray-900">
            Persist this stub (survive server restarts)
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500 ml-6">
          When enabled, this stub will be saved in the filesystem and loaded on restart
        </p>
      </div>
      
      {/* Body Patterns */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Request Body Matching
          </label>
          <button 
            type="button" 
            onClick={() => setShowBodyPatternHelp(!showBodyPatternHelp)}
            className="text-gray-400 hover:text-gray-500"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        
        {showBodyPatternHelp && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <p><strong>equalToJson</strong>: Matches exact JSON structure</p>
            <p><strong>matchesJsonPath</strong>: Matches using JSONPath expression</p>
            <p><strong>equalTo</strong>: Matches exact body text</p>
            <p><strong>contains</strong>: Body contains this text</p>
            <p><strong>matches</strong>: Body matches this regex pattern</p>
            <p><strong>matchesXPath</strong>: XML body matches this XPath</p>
          </div>
        )}
        
        {/* Body Pattern List */}
        <div className="bg-gray-50 rounded-md p-3 mb-3">
          {!stub.request.bodyPatterns || stub.request.bodyPatterns.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No body patterns defined</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stub.request.bodyPatterns.map((pattern, index) => (
                <li key={index} className="py-2 flex justify-between items-center">
                  <div className="text-sm">
                    {getBodyPatternLabel(pattern)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBodyPattern(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Add Body Pattern */}
        <div className="space-y-2">
          <div>
            <select
              value={bodyPatternType}
              onChange={(e) => setBodyPatternType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="equalToJson">Equal to JSON</option>
              <option value="matchesJsonPath">Matches JSONPath</option>
              <option value="equalTo">Equal to (exact text)</option>
              <option value="contains">Contains text</option>
              <option value="matches">Matches regex</option>
              <option value="matchesXPath">Matches XPath</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={bodyPatternValue}
              onChange={(e) => setBodyPatternValue(e.target.value)}
              className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={getPatternTypePlaceholder()}
            />
            <button
              type="button"
              onClick={addBodyPattern}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!bodyPatternValue}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Metadata (optional) */}
      <div>
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Metadata (Advanced)
          </label>
          <Sliders className="ml-2 h-4 w-4 text-gray-400" />
        </div>
        <textarea
          value={stub.metadata ? JSON.stringify(stub.metadata, null, 2) : ''}
          onChange={(e) => {
            try {
              const metadata = e.target.value ? JSON.parse(e.target.value) : undefined;
              onChange('metadata', metadata);
            } catch (err) {
              // Ignore invalid JSON, leave as is
            }
          }}
          rows={4}
          className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono"
          placeholder='{"source": "manual", "info": "Custom stub data"}'
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional JSON metadata for organization or custom integrations
        </p>
      </div>
    </div>
  );
};

export default AdvancedConfig;