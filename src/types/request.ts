export interface RequestLog {
  id: string;
  timestamp: string;
  request: {
    method: string;
    url: string;
    absoluteUrl: string;
    headers: Record<string, string[]>;
    body?: string;
    queryParams: Record<string, string[]>;
  };
  responseDefinition: {
    status: number;
    bodyFileName?: string;
    body?: string;
    headers?: Record<string, string>;
  };
  wasMatched: boolean;
  stubMapping?: string;
}