// src/popup/components/ContactsTab.jsx
import React from 'react';

function ContactsTab({ contacts, onDelete }) {
  return (
    <div className="space-y-3">
      {contacts.map(contact => (
        <div
          key={contact.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{contact.name || 'Unnamed Contact'}</h3>
              {contact.title && (
                <p className="text-sm text-gray-600">{contact.title}</p>
              )}
              {contact.accountName && (
                <p className="text-sm text-blue-600">{contact.accountName}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(contact.id)}
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
              <p className="text-gray-900 truncate">{contact.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="text-gray-900">{contact.phone || 'N/A'}</p>
            </div>
            {contact.mailingAddress && (
              <div className="col-span-2">
                <span className="text-gray-500">Address:</span>
                <p className="text-gray-900 text-xs">{contact.mailingAddress}</p>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-500">Owner:</span>
              <p className="text-gray-900">{contact.owner || 'N/A'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactsTab;