export interface GraphQLStub {
  id: string;
  name: string;
  operationName: string;
  query: string;
  variables?: string;
  response: string;
  priority?: number;
  scenarioName?: string;
  requiredScenarioState?: string;
  newScenarioState?: string;
  persistent?: boolean;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export const defaultGraphQLStub: GraphQLStub = {
  id: '',
  name: 'New GraphQL Stub',
  operationName: '',
  query: '',
  response: '{"data": {}}',
  enabled: true,
};