export interface RequestPattern {
  method: string;
  urlPattern?: string;
  url?: string;
  urlPathPattern?: string;
  urlPath?: string;
  queryParameters?: Record<string, QueryParameter>;
  headers?: Record<string, HeaderParameter>;
  bodyPatterns?: BodyPattern[];
  body?: string;
}

export interface QueryParameter {
  equalTo?: string;
  contains?: string;
  matches?: string;
  doesNotMatch?: string;
  absent?: boolean;
}

export interface HeaderParameter {
  equalTo?: string;
  contains?: string;
  matches?: string;
  doesNotMatch?: string;
  absent?: boolean;
}

export interface BodyPattern {
  equalTo?: string;
  equalToJson?: string;
  matchesJsonPath?: string;
  matchesXPath?: string;
  contains?: string;
  matches?: string;
  doesNotMatch?: string;
}

export interface ResponseDefinition {
  status: number;
  statusMessage?: string;
  headers?: Record<string, string>;
  body?: string;
  jsonBody?: any;
  base64Body?: string;
  fixedDelayMilliseconds?: number;
  chunkedDribbleDelay?: {
    numberOfChunks: number;
    totalDuration: number;
  };
  fault?: 'CONNECTION_RESET_BY_PEER' | 'EMPTY_RESPONSE' | 'MALFORMED_RESPONSE_CHUNK' | 'RANDOM_DATA_THEN_CLOSE';
  transformers?: string[];
}

export interface Scenario {
  name: string;
  state?: string;
}

export interface Stub {
  id: string;
  name: string;
  request: RequestPattern | string;
  response: ResponseDefinition | string;
  priority?: number;
  scenario?: Scenario;
  requiredScenarioState?: string;
  newScenarioState?: string;
  persistent?: boolean;
  enabled?: boolean;
  metadata?: Record<string, any> | string;
}

export const defaultStub: Stub = {
  id: '',
  name: 'New Stub',
  request: {
    method: 'GET',
    urlPath: '/',
  },
  response: {
    status: 200,
    body: '{"message": "Hello from WireMock UI!"}',
  },
  enabled: true,
};