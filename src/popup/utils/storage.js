// src/popup/utils/storage.js

export const storageAPI = {
  // Get all Salesforce data
  async getAllData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['salesforce_data'], (result) => {
        resolve(result.salesforce_data || {
          leads: [],
          contacts: [],
          accounts: [],
          opportunities: [],
          tasks: [],
          lastSync: {}
        });
      });
    });
  },

  // Get data for specific object type
  async getObjectData(objectType) {
    const data = await this.getAllData();
    return data[objectType] || [];
  },

  // Delete a specific record
  async deleteRecord(objectType, recordId) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'deleteRecord',
        objectType,
        recordId
      }, (response) => {
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Failed to delete record'));
        }
      });
    });
  },

  // Extract data from current tab
  async extractFromCurrentTab() {
    return new Promise((resolve, reject) => {
      try {
        console.log('[Storage API] Starting extraction...');
        // Get current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          console.log('[Storage API] Tabs found:', tabs.length);
          if (!tabs || tabs.length === 0) {
            reject(new Error('No active tab found'));
            return;
          }

          const currentTab = tabs[0];
          console.log('[Storage API] Current tab URL:', currentTab.url);

          // Check if we're on a Salesforce page
          if (!currentTab.url.includes('salesforce.com') && !currentTab.url.includes('force.com')) {
            reject(new Error('Please open this extension on a Salesforce page'));
            return;
          }

          // Send extraction message to content script with retry logic
          const attemptExtraction = (attempt = 1) => {
            console.log('[Storage API] Sending extract message, attempt:', attempt);
            
            chrome.tabs.sendMessage(
              currentTab.id,
              { action: 'extract' },
              { frameId: 0 }, // Target main frame
              (response) => {
                const error = chrome.runtime.lastError;
                
                if (error) {
                  console.log('[Storage API] Error:', error.message);
                  
                  // Retry if content script not ready (max 3 attempts)
                  if (attempt < 3 && error.message?.includes('Receiving end does not exist')) {
                    console.log('[Storage API] Content script not ready, retrying...');
                    setTimeout(() => {
                      attemptExtraction(attempt + 1);
                    }, 500);
                    return;
                  }
                  
                  // Different error messages for different scenarios
                  if (error.message?.includes('Receiving end does not exist')) {
                    reject(new Error('Extension not active on this page. Please refresh the page and try again.'));
                  } else if (error.message?.includes('Extension context invalidated')) {
                    reject(new Error('Extension was updated. Please refresh the page.'));
                  } else if (error.message?.includes('Cannot access')) {
                    reject(new Error('Cannot access this page. Make sure you have permission to view it.'));
                  } else {
                    reject(new Error(`Connection failed: ${error.message}`));
                  }
                  return;
                }

                // Check if response is valid
                if (!response) {
                  console.log('[Storage API] No response from content script');
                  reject(new Error('No response from page. The page might not be fully loaded.'));
                  return;
                }

                console.log('[Storage API] Response received:', response);

                if (response.success) {
                  console.log('[Storage API] Extraction successful, saving data...');
                  // Save to storage
                  this.getAllData().then((data) => {
                    const objectType = response.objectType;
                    const newRecords = response.records || [];

                    if (newRecords.length === 0) {
                      reject(new Error('No records found on this page. Make sure you\'re viewing a list or detail page with data.'));
                      return;
                    }

                    // Deduplicate records
                    const existingRecords = data[objectType] || [];
                    const recordMap = new Map(existingRecords.map((r) => [r.id, r]));
                    newRecords.forEach((record) => recordMap.set(record.id, record));

                    data[objectType] = Array.from(recordMap.values());
                    data.lastSync[objectType] = Date.now();

                    console.log('[Storage API] Saving', data[objectType].length, 'records for', objectType);
                    chrome.storage.local.set({ salesforce_data: data }, () => {
                      if (chrome.runtime.lastError) {
                        reject(new Error('Failed to save data: ' + chrome.runtime.lastError.message));
                      } else {
                        console.log('[Storage API] Data saved successfully');
                        resolve({
                          success: true,
                          objectType,
                          recordCount: data[objectType].length,
                        });
                      }
                    });
                  }).catch(reject);
                } else {
                  const errorMsg = response.error || 'Unknown extraction error';
                  console.log('[Storage API] Extraction failed:', errorMsg);
                  reject(new Error(errorMsg));
                }
              }
            );
          };

          // Start extraction with retry
          attemptExtraction();
        });
      } catch (err) {
        console.error('[Storage API] Error:', err);
        reject(new Error(`Extraction error: ${err.message}`));
      }
    });
  },

  // Export data
  async exportData(format = 'json') {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'exportData',
        format
      }, (response) => {
        if (response?.success && response?.data) {
          // Create blob and download
          const mimeType = format === 'json' ? 'application/json' : 'text/csv';
          const blob = new Blob([response.data], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          // Create temporary download link
          const link = document.createElement('a');
          link.href = url;
          link.download = response.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          resolve({ success: true });
        } else {
          reject(new Error(response?.error || 'Export failed'));
        }
      });
    });
  },

  // Clear all data
  async clearAllData() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'clearAllData'
      }, (response) => {
        resolve(response);
      });
    });
  },

  // Listen for storage changes
  onDataChanged(callback) {
    const listener = (changes, namespace) => {
      if (namespace === 'local' && changes.salesforce_data) {
        callback(changes.salesforce_data.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },

  // Get last sync time for object type
  async getLastSync(objectType) {
    const data = await this.getAllData();
    return data.lastSync?.[objectType] || null;
  },

  // Search across all data
  async searchAll(query) {
    const data = await this.getAllData();
    const results = {
      leads: [],
      contacts: [],
      accounts: [],
      opportunities: [],
      tasks: []
    };

    const lowerQuery = query.toLowerCase();

    Object.keys(results).forEach(objectType => {
      results[objectType] = (data[objectType] || []).filter(record => {
        return Object.values(record).some(value => {
          return String(value).toLowerCase().includes(lowerQuery);
        });
      });
    });

    return results;
  }
};

export default storageAPI;