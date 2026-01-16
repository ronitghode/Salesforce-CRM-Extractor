// src/popup/components/LeadsTab.jsx
import React from 'react';

function LeadsTab({ leads, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Working': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Unqualified': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-3">
      {leads.map(lead => (
        <div
          key={lead.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{lead.name || 'Unnamed Lead'}</h3>
              <p className="text-sm text-gray-600">{lead.company}</p>
            </div>
            <button
              onClick={() => onDelete(lead.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="text-gray-900 truncate">{lead.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="text-gray-900">{lead.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Source:</span>
              <p className="text-gray-900">{lead.leadSource || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>
              <p className="text-gray-900">{lead.owner || 'N/A'}</p>
            </div>
          </div>

          {lead.status && (
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default LeadsTab;