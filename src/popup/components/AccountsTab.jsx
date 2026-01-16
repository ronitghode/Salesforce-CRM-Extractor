// src/popup/components/AccountsTab.jsx
import React from 'react';

function AccountsTab({ accounts, onDelete }) {
  const formatRevenue = (revenue) => {
    if (!revenue) return 'N/A';
    const num = parseFloat(revenue);
    if (isNaN(num)) return revenue;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-3">
      {accounts.map(account => (
        <div
          key={account.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{account.name || 'Unnamed Account'}</h3>
              {account.industry && (
                <p className="text-sm text-gray-600">{account.industry}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(account.id)}
              className="text-red-500 hover:text-red-700 p-1 ml-2"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {account.website && (
              <div className="col-span-2">
                <span className="text-gray-500">Website:</span>
                <a
                  href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate block"
                >
                  {account.website}
                </a>
              </div>
            )}
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="text-gray-900">{account.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="text-gray-900">{account.type || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Revenue:</span>
              <p className="text-gray-900 font-semibold">{formatRevenue(account.annualRevenue)}</p>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>
              <p className="text-gray-900">{account.owner || 'N/A'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AccountsTab;