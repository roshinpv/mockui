import { Stub } from './stub';

export interface SoapStub extends Stub {
  wsdlUrl?: string;
  soapAction: string;
  soapVersion: '1.1' | '1.2';
  xmlNamespaces: string;
  xpathMatchers: string;
}

export interface XPathMatcher {
  xpath: string;
  expectedValue: string;
  matchType: 'equalTo' | 'contains' | 'matches';
}

export const defaultSoapStub: SoapStub = {
  id: '',
  name: 'New SOAP Stub',
  request: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Request xmlns="http://example.com/soap">
      <Input>Example</Input>
    </Request>
  </soap:Body>
</soap:Envelope>`,
  response: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Response xmlns="http://example.com/soap">
      <Result>Success</Result>
    </Response>
  </soap:Body>
</soap:Envelope>`,
  enabled: true,
  soapAction: '',
  soapVersion: '1.1',
  xmlNamespaces: JSON.stringify({
    'soap': 'http://schemas.xmlsoap.org/soap/envelope/',
    'ns1': 'http://example.com/soap'
  }),
  xpathMatchers: JSON.stringify([]),
  priority: 0,
  scenario: {
    name: '',
    state: ''
  },
  persistent: false,
  metadata: ''
};