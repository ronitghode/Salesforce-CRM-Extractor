// src/background/service-worker.js

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Salesforce CRM Extractor installed');
  
  // Initialize storage
  chrome.storage.local.get(['salesforce_data'], (result) => {
    if (!result.salesforce_data) {
      chrome.storage.local.set({
        salesforce_data: {
          leads: [],
          contacts: [],
          accounts: [],
          opportunities: [],
          tasks: [],
          lastSync: {}
        }
      });
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageDetected') {
    console.log('Page detected:', request.objectType);
    // Store current page type
    chrome.storage.local.set({ currentPageType: request.objectType });
  }
  
  if (request.action === 'extractFromActiveTab') {
    handleExtractFromActiveTab(sendResponse);
    return true; // Keep channel open
  }

  if (request.action === 'getData') {
    handleGetData(sendResponse);
    return true;
  }

  if (request.action === 'deleteRecord') {
    handleDeleteRecord(request.objectType, request.recordId, sendResponse);
    return true;
  }

  if (request.action === 'clearAllData') {
    handleClearAllData(sendResponse);
    return true;
  }

  if (request.action === 'exportData') {
    handleExportData(request.format, sendResponse);
    return true;
  }
});

// Handle extraction from active tab
async function handleExtractFromActiveTab(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('salesforce.com') && !tab.url.includes('force.com')) {
      sendResponse({
        success: false,
        error: 'Not on a Salesforce page'
      });
      return;
    }

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'extract' }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message
        });
      } else {
        sendResponse(response);
      }
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Get all data from storage
function handleGetData(sendResponse) {
  chrome.storage.local.get(['salesforce_data'], (result) => {
    sendResponse({
      success: true,
      data: result.salesforce_data || {
        leads: [],
        contacts: [],
        accounts: [],
        opportunities: [],
        tasks: [],
        lastSync: {}
      }
    });
  });
}

// Delete a specific record
function handleDeleteRecord(objectType, recordId, sendResponse) {
  chrome.storage.local.get(['salesforce_data'], (result) => {
    const data = result.salesforce_data || {
      leads: [],
      contacts: [],
      accounts: [],
      opportunities: [],
      tasks: [],
      lastSync: {}
    };

    if (data[objectType]) {
      data[objectType] = data[objectType].filter(record => record.id !== recordId);
      
      chrome.storage.local.set({ salesforce_data: data }, () => {
        sendResponse({ success: true });
      });
    } else {
      sendResponse({ success: false, error: 'Invalid object type' });
    }
  });
}

// Clear all data
function handleClearAllData(sendResponse) {
  chrome.storage.local.set({
    salesforce_data: {
      leads: [],
      contacts: [],
      accounts: [],
      opportunities: [],
      tasks: [],
      lastSync: {}
    }
  }, () => {
    sendResponse({ success: true });
  });
}

// Export data
function handleExportData(format, sendResponse) {
  chrome.storage.local.get(['salesforce_data'], (result) => {
    const data = result.salesforce_data;
    
    if (format === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
      sendResponse({ 
        success: true, 
        data: jsonStr,
        format: 'json',
        filename: `salesforce-data-${Date.now()}.json`
      });
    } else if (format === 'csv') {
      // Convert data to CSV format
      const allRecords = [];
      Object.keys(data).forEach(objectType => {
        if (Array.isArray(data[objectType]) && data[objectType].length > 0) {
          data[objectType].forEach(record => {
            allRecords.push({ ...record, objectType });
          });
        }
      });
      
      const csv = convertToCSV(allRecords);
      sendResponse({
        success: true,
        data: csv,
        format: 'csv',
        filename: `salesforce-data-${Date.now()}.csv`
      });
    } else {
      sendResponse({ success: false, error: 'Invalid format' });
    }
  });
}

// Convert array of objects to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Listen for storage changes and broadcast to all extension pages
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.salesforce_data) {
    // Notify all extension pages about data changes
    chrome.runtime.sendMessage({
      action: 'dataUpdated',
      data: changes.salesforce_data.newValue
    }).catch(() => {
      // Ignore errors if no listeners
    });
  }
});