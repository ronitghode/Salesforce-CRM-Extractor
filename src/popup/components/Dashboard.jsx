// src/popup/components/Dashboard.jsx
import React, { useState, useMemo } from 'react';
import LeadsTab from './LeadsTab';
import ContactsTab from './ContactsTab';
import AccountsTab from './AccountsTab';
import OpportunitiesTab from './OpportunitiesTab';
import TasksTab from './TasksTab';

function Dashboard({ data, searchQuery, onDelete, onClearAll }) {
  const [activeTab, setActiveTab] = useState('leads');

  const tabs = [
    { id: 'leads', label: 'Leads', count: data.leads?.length || 0 },
    { id: 'contacts', label: 'Contacts', count: data.contacts?.length || 0 },
    { id: 'accounts', label: 'Accounts', count: data.accounts?.length || 0 },
    { id: 'opportunities', label: 'Opportunities', count: data.opportunities?.length || 0 },
    { id: 'tasks', label: 'Tasks', count: data.tasks?.length || 0 }
  ];

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = {};

    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        filtered[key] = data[key].filter(record => {
          return Object.values(record).some(value => {
            return String(value).toLowerCase().includes(lowerQuery);
          });
        });
      } else {
        filtered[key] = data[key];
      }
    });

    return filtered;
  }, [data, searchQuery]);

  const getLastSyncTime = (objectType) => {
    const timestamp = data.lastSync?.[objectType];
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {/* Last Sync Info */}
        <div className="mb-3 flex justify-between items-center text-xs text-gray-500">
          <span>Last sync: {getLastSyncTime(activeTab)}</span>
          {filteredData[activeTab]?.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear All Data
            </button>
          )}
        </div>

        {/* Content */}
        {filteredData[activeTab]?.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? 'No results found for your search'
                : 'Click "Extract Current Object" to get started'}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'leads' && (
              <LeadsTab
                leads={filteredData.leads}
                onDelete={(id) => onDelete('leads', id)}
              />
            )}
            {activeTab === 'contacts' && (
              <ContactsTab
                contacts={filteredData.contacts}
                onDelete={(id) => onDelete('contacts', id)}
              />
            )}
            {activeTab === 'accounts' && (
              <AccountsTab
                accounts={filteredData.accounts}
                onDelete={(id) => onDelete('accounts', id)}
              />
            )}
            {activeTab === 'opportunities' && (
              <OpportunitiesTab
                opportunities={filteredData.opportunities}
                onDelete={(id) => onDelete('opportunities', id)}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksTab
                tasks={filteredData.tasks}
                onDelete={(id) => onDelete('tasks', id)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;