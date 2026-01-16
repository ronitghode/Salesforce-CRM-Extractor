// src/popup/components/TasksTab.jsx
import React from 'react';

function TasksTab({ tasks, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Waiting': 'bg-yellow-100 text-yellow-800',
      'Deferred': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600',
      'Normal': 'text-blue-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    try {
      const due = new Date(dueDate);
      return due < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`bg-white rounded-lg border p-4 hover:shadow-md transition ${
            isOverdue(task.dueDate) ? 'border-red-300' : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{task.subject || 'Unnamed Task'}</h3>
              {task.relatedTo && (
                <p className="text-sm text-blue-600">{task.relatedTo}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(task.id)}
              className="text-red-500 hover:text-red-700 p-1 ml-2"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-500">Due Date:</span>
              <p className={`${isOverdue(task.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                {formatDate(task.dueDate)}
                {isOverdue(task.dueDate) && (
                  <span className="ml-1 text-xs">(Overdue)</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Priority:</span>
              <p className={`font-semibold ${getPriorityColor(task.priority)}`}>
                {task.priority || 'N/A'}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Assigned To:</span>
              <p className="text-gray-900">{task.assignedTo || 'N/A'}</p>
            </div>
          </div>

          {task.status && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default TasksTab;