// src/popup/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import storageAPI from './utils/storage';
import '../styles/tailwind.css';

function App() {
  const [data, setData] = useState({
    leads: [],
    contacts: [],
    accounts: [],
    opportunities: [],
    tasks: [],
    lastSync: {}
  });
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
    
    // Listen for data changes
    const unsubscribe = storageAPI.onDataChanged((newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await storageAPI.getAllData();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    try {
      setExtracting(true);
      setError(null);
      
      // Check if we have an active tab URL
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('No active tab found. Please ensure Salesforce is open.');
      }
      
      const currentTab = tabs[0];
      if (!currentTab.url) {
        throw new Error('Unable to access the current page.');
      }

      if (!currentTab.url.includes('salesforce.com') && !currentTab.url.includes('force.com')) {
        throw new Error('⚠️ Not on Salesforce. Please open Salesforce and try again.');
      }

      await storageAPI.extractFromCurrentTab();
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to extract data');
      console.error('Extract error:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleDelete = async (objectType, recordId) => {
    try {
      await storageAPI.deleteRecord(objectType, recordId);
      await loadData();
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const handleExport = async (format) => {
    try {
      await storageAPI.exportData(format);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all extracted data?')) {
      try {
        await storageAPI.clearAllData();
        await loadData();
      } catch (err) {
        setError('Failed to clear data');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">
            Salesforce Data Extractor
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
              title="Export as JSON"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
              title="Export as CSV"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Extract Button */}
        <button
          onClick={handleExtract}
          disabled={extracting}
          className={`w-full py-2 px-4 rounded font-medium transition ${
            extracting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {extracting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Extracting...
            </span>
          ) : (
            'Extract Current Object'
          )}
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search all records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mt-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <span className="text-red-600 font-semibold text-lg mt-1">⚠️</span>
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <p className="text-red-600 text-xs mt-1">
                💡 Tip: Make sure the Salesforce page is fully loaded and try again.
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 text-lg"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Dashboard */}
      <div className="flex-1 overflow-hidden">
        <Dashboard
          data={data}
          searchQuery={searchQuery}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
}

export default App;