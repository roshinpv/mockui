import { Stub } from '../types/stub';
import { RequestLog } from '../types/request';
import { ScenarioState } from '../types/scenario';
import { DashboardStats } from '../types/dashboard';

const API_BASE = 'http://localhost:8080/api';

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE}/dashboard/stats`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch dashboard statistics');
  }
  return response.json();
};

// Stub API
export const getStubs = async (): Promise<Stub[]> => {
  const response = await fetch(`${API_BASE}/stubs`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch stubs');
  }
  return response.json();
};

export const getStubById = async (id: string): Promise<Stub | null> => {
  const response = await fetch(`${API_BASE}/stubs/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.text();
    throw new Error(error || 'Failed to fetch stub');
  }
  return response.json();
};

export const createStub = async (stub: Stub): Promise<Stub> => {
  const response = await fetch(`${API_BASE}/stubs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stub),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create stub');
  }
  return response.json();
};

export const updateStub = async (id: string, stub: Stub): Promise<Stub> => {
  const response = await fetch(`${API_BASE}/stubs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stub),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update stub');
  }
  return response.json();
};

export const deleteStub = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/stubs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to delete stub');
  }
};

// Request Journal API
export const getRequests = async (): Promise<RequestLog[]> => {
  const response = await fetch(`${API_BASE}/requests`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch requests');
  }
  return response.json();
};

export const clearRequests = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/requests`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to clear requests');
  }
};

// Scenarios API
export const getScenarios = async (): Promise<ScenarioState[]> => {
  const response = await fetch(`${API_BASE}/scenarios`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch scenarios');
  }
  return response.json();
};

export const updateScenario = async (id: string, state: string): Promise<ScenarioState> => {
  const response = await fetch(`${API_BASE}/scenarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update scenario');
  }
  return response.json();
};

export const resetScenarios = async (): Promise<void> => {
  const response = await fetch(`${API_BASE}/scenarios/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to reset scenarios');
  }
};

// Import/Export API
export const importOpenApi = async (spec: string): Promise<Stub[]> => {
  const response = await fetch(`${API_BASE}/import/openapi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ spec }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to import OpenAPI spec');
  }
  return response.json();
};

export const exportStubs = async (): Promise<string> => {
  const response = await fetch(`${API_BASE}/export/stubs`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to export stubs');
  }
  return response.text();
};