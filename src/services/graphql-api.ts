import { GraphQLStub } from '../types/graphql';

const API_BASE = 'http://localhost:8080/api/graphql-stubs';

export const getGraphQLStubs = async (): Promise<GraphQLStub[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch GraphQL stubs');
  return response.json();
};

export const getGraphQLStubById = async (id: string): Promise<GraphQLStub> => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch GraphQL stub');
  return response.json();
};

export const createGraphQLStub = async (stub: GraphQLStub): Promise<GraphQLStub> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stub),
  });
  if (!response.ok) throw new Error('Failed to create GraphQL stub');
  return response.json();
};

export const updateGraphQLStub = async (id: string, stub: GraphQLStub): Promise<GraphQLStub> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stub),
  });
  if (!response.ok) throw new Error('Failed to update GraphQL stub');
  return response.json();
};

export const deleteGraphQLStub = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete GraphQL stub');
};