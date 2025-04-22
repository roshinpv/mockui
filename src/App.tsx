import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StubList from './pages/StubList';
import StubEditor from './pages/StubEditor';
import GraphQLStubList from './pages/GraphQLStubList';
import GraphQLStubEditor from './pages/GraphQLStubEditor';
import SoapStubList from './pages/SoapStubList';
import SoapStubEditor from './pages/SoapStubEditor';
import ScenarioManager from './pages/ScenarioManager';
import RequestJournal from './pages/RequestJournal';
import ImportExport from './pages/ImportExport';
import Settings from './pages/Settings';
import Recording from './pages/Recording';
import { StubProvider } from './context/StubContext';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StubProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stubs" element={<StubList />} />
              <Route path="/stubs/new" element={<StubEditor />} />
              <Route path="/stubs/:id" element={<StubEditor />} />
              <Route path="/graphql-stubs" element={<GraphQLStubList />} />
              <Route path="/graphql-stubs/new" element={<GraphQLStubEditor />} />
              <Route path="/graphql-stubs/:id" element={<GraphQLStubEditor />} />
              <Route path="/soap-stubs" element={<SoapStubList />} />
              <Route path="/soap-stubs/new" element={<SoapStubEditor />} />
              <Route path="/soap-stubs/:id" element={<SoapStubEditor />} />
              <Route path="/scenarios" element={<ScenarioManager />} />
              <Route path="/requests" element={<RequestJournal />} />
              <Route path="/import-export" element={<ImportExport />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/recording" element={<Recording />} />
            </Routes>
          </Layout>
        </Router>
      </StubProvider>
    </QueryClientProvider>
  );
}

export default App;