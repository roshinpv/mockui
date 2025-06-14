import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  FileJson, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  GitBranch,
  Sliders,
  Globe,
  Code,
  Play,
  RefreshCw,
  Server
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SoapStub, defaultSoapStub, XPathMatcher } from '../types/soap';
import { getSoapStubById, createSoapStub, updateSoapStub, validateWsdl } from '../services/soap-api';

const SoapStubEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [stub, setStub] = useState<SoapStub>(defaultSoapStub);
  const [activeTab, setActiveTab] = useState('request');
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [xmlNamespaces, setXmlNamespaces] = useState<Record<string, string>>({});
  const [xpathMatchers, setXpathMatchers] = useState<XPathMatcher[]>([]);
  const [executeResponse, setExecuteResponse] = useState<{status: number, body: string, headers: Record<string, string>} | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch existing stub if editing
  const { data: existingStub } = useQuery({
    queryKey: ['soap-stub', id],
    queryFn: () => getSoapStubById(id!),
    enabled: !!id && id !== 'new'
  });

  // Mutations for creating/updating stubs
  const createMutation = useMutation({
    mutationFn: createSoapStub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soap-stubs'] });
      navigate('/soap-stubs');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (stub: SoapStub) => updateSoapStub(stub.id, stub),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soap-stubs'] });
      navigate('/soap-stubs');
    }
  });

  useEffect(() => {
    if (existingStub) {
      setStub(existingStub);
      try {
        setXmlNamespaces(JSON.parse(existingStub.xmlNamespaces));
        setXpathMatchers(JSON.parse(existingStub.xpathMatchers));
      } catch (e) {
        console.error('Failed to parse XML namespaces or XPath matchers:', e);
      }
    }
  }, [existingStub]);

  const handleChange = (field: keyof SoapStub, value: any) => {
    if (field === 'scenario') {
      setStub(prev => ({
        ...prev,
        scenario: {
          name: value.name || '',
          state: value.state || ''
        }
      }));
    } else {
      setStub(prev => ({ ...prev, [field]: value }));
    }
    setIsDirty(true);
    setErrors([]);
  };

  const handleToggleEnabled = () => {
    handleChange('enabled', !stub.enabled);
  };

  const handleXmlNamespacesChange = (key: string, value: string) => {
    const updatedNamespaces = { ...xmlNamespaces, [key]: value };
    setXmlNamespaces(updatedNamespaces);
    handleChange('xmlNamespaces', JSON.stringify(updatedNamespaces));
  };

  const handleXPathMatcherChange = (index: number, field: keyof XPathMatcher, value: string) => {
    const updatedMatchers = [...xpathMatchers];
    updatedMatchers[index] = { ...updatedMatchers[index], [field]: value };
    setXpathMatchers(updatedMatchers);
    handleChange('xpathMatchers', JSON.stringify(updatedMatchers));
  };

  const addXPathMatcher = () => {
    const newMatcher: XPathMatcher = {
      xpath: '',
      expectedValue: '',
      matchType: 'equalTo'
    };
    const updatedMatchers = [...xpathMatchers, newMatcher];
    setXpathMatchers(updatedMatchers);
    handleChange('xpathMatchers', JSON.stringify(updatedMatchers));
  };

  const removeXPathMatcher = (index: number) => {
    const updatedMatchers = [...xpathMatchers];
    updatedMatchers.splice(index, 1);
    setXpathMatchers(updatedMatchers);
    handleChange('xpathMatchers', JSON.stringify(updatedMatchers));
  };

  const validateStub = (): string[] => {
    const errors: string[] = [];
    
    // Basic required field validation
    if (!stub.name) errors.push('Name is required');
    if (!stub.soapAction) errors.push('SOAP Action is required');
    if (!stub.request) errors.push('Request XML is required');
    if (!stub.response) errors.push('Response XML is required');
    
    // SOAP XML format validation
    if (stub.request && !validateXml(stub.request, 'request')) {
      errors.push('Request XML is not valid SOAP format');
    }
    
    if (stub.response && !validateXml(stub.response, 'response')) {
      errors.push('Response XML is not valid SOAP format');
    }
    
    // Validate JSON string fields
    try {
      const namespaces = JSON.parse(stub.xmlNamespaces);
      
      // Check if namespaces are valid
      for (const [prefix, uri] of Object.entries(namespaces)) {
        if (!prefix) errors.push('Namespace prefix cannot be empty');
        if (!uri) errors.push(`Namespace URI for prefix "${prefix}" cannot be empty`);
      }
    } catch (e) {
      errors.push('XML Namespaces must be valid JSON');
    }

    try {
      const matchers = JSON.parse(stub.xpathMatchers);
      
      // Validate XPath matchers
      for (let i = 0; i < matchers.length; i++) {
        const matcher = matchers[i];
        if (!matcher.xpath) errors.push(`XPath expression is required for matcher #${i+1}`);
        if (!matcher.expectedValue) errors.push(`Expected value is required for matcher #${i+1}`);
        if (!matcher.matchType) errors.push(`Match type is required for matcher #${i+1}`);
      }
    } catch (e) {
      errors.push('XPath Matchers must be valid JSON');
    }
    
    // Validate SOAP version
    if (stub.soapVersion !== '1.1' && stub.soapVersion !== '1.2') {
      errors.push('SOAP version must be either 1.1 or 1.2');
    }

    return errors;
  };
  
  // Helper function to check if XML is valid SOAP format
  const validateXml = (xml: string, type: 'request' | 'response'): boolean => {
    // Basic check for XML structure
    const xmlTrimmed = xml.trim();
    if (!xmlTrimmed.startsWith('<?xml') && !xmlTrimmed.startsWith('<soap:Envelope') && !xmlTrimmed.startsWith('<Envelope')) {
      return false;
    }
    
    // Check for required SOAP elements
    const hasEnvelope = xmlTrimmed.includes('<soap:Envelope') || xmlTrimmed.includes('<Envelope');
    const hasBody = xmlTrimmed.includes('<soap:Body') || xmlTrimmed.includes('<Body');
    
    return hasEnvelope && hasBody;
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
      navigate('/soap-stubs');
    } catch (err: any) {
      // Enhanced error handling with more specific error messages
      if (err.response && err.response.data) {
        setErrors([`Server error: ${err.response.data.error || err.response.data.message || 'Unknown server error'}`]);
      } else if (err.message) {
        setErrors([`Failed to save SOAP stub: ${err.message}`]);
      } else {
        setErrors(['An unexpected error occurred while saving the SOAP stub']);
      }
    }
  };

  const handleWsdlValidation = async () => {
    if (!stub.wsdlUrl) {
      setErrors(['WSDL URL is required']);
      return;
    }

    try {
      await validateWsdl(stub.wsdlUrl);
      setErrors([]);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to validate WSDL';
      setErrors([errorMessage]);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecuteResponse(null);
    
    try {
      // Prepare the SOAP request
      const soapEnvelope = stub.request;
      
      // Execute the request
      const response = await fetch('http://localhost:8080/__admin/soap', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': stub.soapAction
        },
        body: soapEnvelope,
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
      setErrors([`Failed to execute SOAP stub: ${err instanceof Error ? err.message : String(err)}`]);
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
            onClick={() => navigate('/soap-stubs')}
            className="mr-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-navy-500">
              {id === 'new' ? 'Create New SOAP Stub' : 'Edit SOAP Stub'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Define how your mock SOAP API should respond
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

      {/* SOAP Action */}
      <div className="mb-6">
        <label htmlFor="soapAction" className="block text-sm font-medium text-navy-500">
          SOAP Action
        </label>
        <input
          type="text"
          id="soapAction"
          name="soapAction"
          value={stub.soapAction}
          onChange={(e) => handleChange('soapAction', e.target.value)}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter SOAP Action"
        />
      </div>

      {/* SOAP Version */}
      <div className="mb-6">
        <label htmlFor="soapVersion" className="block text-sm font-medium text-navy-500">
          SOAP Version
        </label>
        <select
          id="soapVersion"
          name="soapVersion"
          value={stub.soapVersion}
          onChange={(e) => handleChange('soapVersion', e.target.value)}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="1.1">SOAP 1.1</option>
          <option value="1.2">SOAP 1.2</option>
        </select>
      </div>

      {/* WSDL URL */}
      <div className="mb-6">
        <label htmlFor="wsdlUrl" className="block text-sm font-medium text-navy-500">
          WSDL URL (Optional)
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="wsdlUrl"
            name="wsdlUrl"
            value={stub.wsdlUrl || ''}
            onChange={(e) => handleChange('wsdlUrl', e.target.value)}
            className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter WSDL URL"
          />
          <button
            type="button"
            onClick={handleWsdlValidation}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Validate
          </button>
        </div>
      </div>

      {/* XML Namespaces */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-500">
          XML Namespaces
        </label>
        <div className="mt-1 space-y-2">
          {Object.entries(xmlNamespaces).map(([prefix, uri], index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={prefix}
                onChange={(e) => {
                  const newNamespaces = { ...xmlNamespaces };
                  delete newNamespaces[prefix];
                  newNamespaces[e.target.value] = uri;
                  setXmlNamespaces(newNamespaces);
                  handleChange('xmlNamespaces', JSON.stringify(newNamespaces));
                }}
                className="block w-1/3 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Prefix"
              />
              <input
                type="text"
                value={uri}
                onChange={(e) => handleXmlNamespacesChange(prefix, e.target.value)}
                className="block w-2/3 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Namespace URI"
              />
              <button
                type="button"
                onClick={() => {
                  const newNamespaces = { ...xmlNamespaces };
                  delete newNamespaces[prefix];
                  setXmlNamespaces(newNamespaces);
                  handleChange('xmlNamespaces', JSON.stringify(newNamespaces));
                }}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleXmlNamespacesChange(`ns${Object.keys(xmlNamespaces).length + 1}`, '')}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Namespace
          </button>
        </div>
      </div>

      {/* XPath Matchers */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-navy-500">
          XPath Matchers
        </label>
        <div className="mt-1 space-y-2">
          {xpathMatchers.map((matcher, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={matcher.xpath}
                onChange={(e) => handleXPathMatcherChange(index, 'xpath', e.target.value)}
                className="block w-1/3 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="XPath Expression"
              />
              <input
                type="text"
                value={matcher.expectedValue}
                onChange={(e) => handleXPathMatcherChange(index, 'expectedValue', e.target.value)}
                className="block w-1/3 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Expected Value"
              />
              <select
                value={matcher.matchType}
                onChange={(e) => handleXPathMatcherChange(index, 'matchType', e.target.value)}
                className="block w-1/4 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="equalTo">Equals</option>
                <option value="contains">Contains</option>
                <option value="matches">Matches</option>
              </select>
              <button
                type="button"
                onClick={() => removeXPathMatcher(index)}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addXPathMatcher}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add XPath Matcher
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('request')}
            className={`${
              activeTab === 'request'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Code className="h-4 w-4 mr-2" />
            Request XML
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`${
              activeTab === 'response'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Code className="h-4 w-4 mr-2" />
            Response XML
          </button>
        </nav>
      </div>

      {/* Request/Response XML Editor */}
      <div className="mb-6">
        <textarea
          value={activeTab === 'request' ? stub.request : stub.response}
          onChange={(e) => handleChange(activeTab === 'request' ? 'request' : 'response', e.target.value)}
          className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          rows={15}
          placeholder={`Enter ${activeTab === 'request' ? 'request' : 'response'} XML`}
        />
      </div>
    </div>
  );
};

export default SoapStubEditor;