import { SoapStub } from '../types/soap';

const API_BASE = 'http://localhost:8080/api/soap-stubs';

export const getSoapStubs = async (): Promise<SoapStub[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch SOAP stubs');
  }
  return response.json();
};

export const getSoapStubById = async (id: string): Promise<SoapStub> => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch SOAP stub');
  }
  return response.json();
};

export const createSoapStub = async (stub: SoapStub): Promise<SoapStub> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stub),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create SOAP stub');
  }
  return response.json();
};

export const updateSoapStub = async (id: string, stub: SoapStub): Promise<SoapStub> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stub),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update SOAP stub');
  }
  return response.json();
};

export const deleteSoapStub = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to delete SOAP stub');
  }
};

export const validateWsdl = async (url: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/validate-wsdl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to validate WSDL');
  }
  
  return true;
};