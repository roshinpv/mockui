import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, AlertTriangle, CheckCircle, Clock, Server, Database, GitBranch, FileX, Activity } from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { DashboardStats } from '../types/dashboard';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your WireMock configuration and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Active Stubs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-navy-100 rounded-md p-3">
                <Server className="h-6 w-6 text-navy-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Stubs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-navy-500">{stats.activeStubs}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* GraphQL Stubs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-navy-100 rounded-md p-3">
                <Database className="h-6 w-6 text-navy-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">GraphQL Stubs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-navy-500">{stats.graphqlStubs}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* SOAP Stubs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-navy-100 rounded-md p-3">
                <FileX className="h-6 w-6 text-navy-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">SOAP Stubs</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-navy-500">{stats.soapStubs}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Stub Button */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 flex flex-col items-center justify-center">
            <PlusCircle className="h-8 w-8 text-white mb-2" />
            <h3 className="text-lg font-medium text-white">Create New Stub</h3>
            <p className="mt-1 text-sm text-indigo-100">
              Define new API responses
            </p>
          </div>
          <div className="bg-indigo-600 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/stubs/new" className="font-medium text-white hover:text-indigo-100">
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Request Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {/* Total Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-navy-100 rounded-md p-3">
                <Database className="h-6 w-6 text-navy-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-navy-500">{stats.totalRequests}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-navy-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-navy-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Requests</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-navy-500">{stats.recentRequests}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-navy-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-navy-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-navy-500">{stats.successRate}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Common tasks and operations
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Link 
                to="/import-export" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Import from OpenAPI
              </Link>
            </div>
            <div>
              <Link 
                to="/scenarios" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset All Scenarios
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;