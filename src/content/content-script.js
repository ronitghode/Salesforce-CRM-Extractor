// src/content/content-script.js

// Visual Status Indicator using Shadow DOM
class ExtractionIndicator {
  constructor() {
    this.container = null;
    this.shadowRoot = null;
  }

  create() {
    // Remove existing indicator if any
    this.remove();

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'sf-extractor-indicator';
    document.body.appendChild(this.container);

    // Create Shadow DOM
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --primary: #0070d2;
        --success: #04844b;
        --error: #c23030;
        --warning: #ffb81c;
      }

      .indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 280px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 999999;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(350px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
        color: white;
        font-size: 14px;
      }

      .icon.loading {
        background: var(--primary);
        animation: spin 1s linear infinite;
      }

      .icon.success {
        background: var(--success);
      }

      .icon.error {
        background: var(--error);
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .title {
        font-weight: 600;
        font-size: 14px;
        color: #000;
        flex: 1;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #000;
      }

      .content {
        font-size: 13px;
        color: #333;
        line-height: 1.5;
      }

      .object-type {
        display: inline-block;
        background: var(--primary);
        color: white;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        margin-top: 8px;
      }

      .record-count {
        display: inline-block;
        margin-left: 8px;
        background: #e8eaed;
        color: #333;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }

      .progress-bar {
        width: 100%;
        height: 4px;
        background: #e8eaed;
        border-radius: 2px;
        margin-top: 10px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: var(--primary);
        animation: progress 2s ease-in-out infinite;
      }

      @keyframes progress {
        0% { width: 10%; }
        50% { width: 90%; }
        100% { width: 10%; }
      }

      .error-message {
        color: var(--error);
        font-size: 12px;
        margin-top: 8px;
      }
    `;

    this.shadowRoot.appendChild(style);
  }

  showLoading(objectType) {
    this.create();
    const html = `
      <div class="indicator">
        <div class="header">
          <div class="icon loading">⟳</div>
          <div class="title">Extracting Data...</div>
          <button class="close-btn" onclick="this.getRootNode().host.style.display='none'">✕</button>
        </div>
        <div class="content">
          Detecting and extracting records from ${objectType || 'current page'}...
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.innerHTML = this.shadowRoot.innerHTML.replace(/<div class="indicator">[\s\S]*?<\/div>/, html);
    
    // Find indicator div and update it
    const style = this.shadowRoot.querySelector('style');
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'indicator';
    indicatorDiv.innerHTML = html.replace(/<div class="indicator">|<\/div>/g, '');
    
    // Clear and rebuild
    const allDivs = Array.from(this.shadowRoot.querySelectorAll('div'));
    allDivs.forEach(d => d.remove());
    
    const indicator = document.createElement('div');
    indicator.className = 'indicator';
    indicator.innerHTML = `
      <div class="header">
        <div class="icon loading">⟳</div>
        <div class="title">Extracting Data...</div>
        <button class="close-btn" onclick="document.getElementById('sf-extractor-indicator').style.display='none'">✕</button>
      </div>
      <div class="content">
        Detecting and extracting records from <strong>${objectType || 'current page'}</strong>...
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(indicator);
  }

  showSuccess(objectType, count) {
    const indicator = this.shadowRoot.querySelector('.indicator');
    if (indicator) {
      indicator.innerHTML = `
        <div class="header">
          <div class="icon success">✓</div>
          <div class="title">Extraction Complete!</div>
          <button class="close-btn" onclick="document.getElementById('sf-extractor-indicator').style.display='none'">✕</button>
        </div>
        <div class="content">
          Successfully extracted <strong>${count}</strong> record${count !== 1 ? 's' : ''}
          <div class="object-type">${objectType.toUpperCase()}</div>
          <div class="record-count">${count} records</div>
        </div>
      `;
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        if (this.container) this.container.style.opacity = '0';
        setTimeout(() => this.remove(), 300);
      }, 4000);
    }
  }

  showError(message) {
    const indicator = this.shadowRoot.querySelector('.indicator');
    if (indicator) {
      indicator.innerHTML = `
        <div class="header">
          <div class="icon error">✕</div>
          <div class="title">Extraction Failed</div>
          <button class="close-btn" onclick="document.getElementById('sf-extractor-indicator').style.display='none'">✕</button>
        </div>
        <div class="content">
          <div class="error-message">${message}</div>
        </div>
      `;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (this.container) this.container.style.opacity = '0';
        setTimeout(() => this.remove(), 300);
      }, 5000);
    }
  }

  remove() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.shadowRoot = null;
    }
  }
}

// Global indicator instance
const indicator = new ExtractionIndicator();

// Object type detection
function detectObjectType() {
  const url = window.location.pathname.toLowerCase();
  const title = document.title.toLowerCase();

  console.log('[SF Extractor] Current URL:', window.location.pathname);
  console.log('[SF Extractor] Page Title:', document.title);

  // Check URL patterns (case-insensitive)
  if (url.includes('/lightning/o/lead/')) return 'leads';
  if (url.includes('/lightning/o/contact/')) return 'contacts';
  if (url.includes('/lightning/o/account/')) return 'accounts';
  if (url.includes('/lightning/o/opportunity/')) return 'opportunities';
  if (url.includes('/lightning/o/task/')) return 'tasks';

  // Check title patterns
  if (title.includes('lead')) return 'leads';
  if (title.includes('contact')) return 'contacts';
  if (title.includes('account')) return 'accounts';
  if (title.includes('opportunity')) return 'opportunities';
  if (title.includes('task')) return 'tasks';

  // Check page headers
  const headers = Array.from(document.querySelectorAll('h1, h2, .pageTitle, [data-qa="page-header"]')).map(h => h.textContent.toLowerCase());
  console.log('[SF Extractor] Page headers:', headers);

  for (const header of headers) {
    if (header.includes('lead')) return 'leads';
    if (header.includes('contact')) return 'contacts';
    if (header.includes('account')) return 'accounts';
    if (header.includes('opportunity')) return 'opportunities';
    if (header.includes('task')) return 'tasks';
  }

  console.log('[SF Extractor] Could not detect object type');
  return null;
}

// Detect if we're on a detail view or list view
function isDetailView() {
  return window.location.pathname.match(/\/r\/[^/]+\/\w+/) !== null;
}

// Detect if we're in Kanban view (Pipeline Inspection)
function isKanbanView() {
  return window.location.pathname.includes('/lightning/o/') && 
         (window.location.search.includes('kanban') || 
          document.querySelector('[role="tablist"] [aria-selected="true"]')?.textContent?.includes('Kanban') ||
          document.querySelector('.kanban-view, [data-qa="kanban"], .slds-kanban'));
}

// Extract from Kanban view (e.g., Opportunities Pipeline)
function extractFromKanbanView() {
  const records = [];
  const seen = new Set();

  // Kanban columns (stages)
  const kanbanColumns = document.querySelectorAll('.kanban-column, [data-qa="kanban-column"], .slds-scrollable_x > [role="region"]');
  
  kanbanColumns.forEach((column) => {
    const stageLabel = column.querySelector('[class*="stage"], [data-qa*="stage"], .kanban-header')?.textContent?.trim();
    
    // Extract cards from this column
    const cards = column.querySelectorAll('.kanban-card, [role="option"], [data-qa*="card"]');
    
    cards.forEach((card) => {
      const link = card.querySelector('a[href*="/lightning/r/"]');
      if (!link) return;

      const href = link.href;
      const idMatch = href.match(/\/r\/([^/]+)\/(\w+)/);
      if (!idMatch) return;

      const id = idMatch[2];
      if (seen.has(id)) return;
      seen.add(id);

      // Extract visible text from card
      const record = {
        id: id,
        name: link.textContent?.trim() || '',
        stage: stageLabel || 'Unknown',
        extractedAt: Date.now()
      };

      // Extract other card details
      const details = card.textContent?.trim().split('\n').filter(t => t.length > 0);
      if (details && details.length > 1) {
        let fieldIndex = 1;
        for (let i = 1; i < details.length && fieldIndex < 5; i++) {
          if (!details[i].includes(record.name)) {
            record[`field_${fieldIndex}`] = details[i];
            fieldIndex++;
          }
        }
      }

      records.push(record);
    });
  });

  return records;
}

// Handle pagination - auto-scroll and extract all pages
async function extractWithPagination() {
  const allRecords = [];
  const seen = new Set();
  let pageCount = 0;
  const maxPages = 10; // Safety limit

  try {
    while (pageCount < maxPages) {
      // Extract records from current page
      const currentRecords = extractFromListView();
      
      currentRecords.forEach((record) => {
        if (!seen.has(record.id)) {
          seen.add(record.id);
          allRecords.push(record);
        }
      });

      pageCount++;

      // Look for next page button/link
      const nextButton = document.querySelector(
        'button[aria-label*="Next"], a[aria-label*="Next"], [data-qa*="next"]'
      ) || Array.from(document.querySelectorAll('button, a')).find(el => 
        el.textContent?.trim() === 'Next' && !el.disabled
      );

      if (!nextButton || nextButton.disabled) {
        console.log('[SF Extractor] Reached last page');
        break;
      }

      // Click next button
      nextButton.click();

      // Wait for page to load (look for new content)
      await new Promise(resolve => {
        let attempts = 0;
        const checkInterval = setInterval(() => {
          const newRecords = extractFromListView();
          // If we have new records or max attempts, continue
          if (newRecords.some(r => !seen.has(r.id)) || attempts > 15) {
            clearInterval(checkInterval);
            resolve();
          }
          attempts++;
        }, 300);

        // Fallback timeout
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });
    }
  } catch (error) {
    console.error('[SF Extractor] Pagination error:', error);
  }

  return allRecords;
}

// Extract related records from detail page (e.g., Contacts under Account)
function extractRelatedRecords() {
  const relatedRecords = [];

  // Find related list sections
  const relatedLists = document.querySelectorAll(
    '[role="region"] [data-label*="Related"], .slds-card__header, [class*="related"]'
  );

  relatedLists.forEach((section) => {
    const listTitle = section.textContent?.trim();
    if (!listTitle) return;

    // Find the table or list within this section
    const parent = section.closest('[role="region"], .slds-card, [class*="section"]');
    if (!parent) return;

    const rows = parent.querySelectorAll('tbody tr, [role="row"]');
    
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td, [role="gridcell"]');
      if (cells.length === 0) return;

      const link = row.querySelector('a[href*="/lightning/r/"]');
      if (!link) return;

      const href = link.href;
      const idMatch = href.match(/\/r\/([^/]+)\/(\w+)/);
      if (!idMatch) return;

      const record = {
        id: idMatch[2],
        name: link.textContent?.trim() || '',
        relatedType: listTitle,
        parentRecord: document.querySelector('h1, [data-testid="title"]')?.textContent?.trim(),
        extractedAt: Date.now()
      };

      // Extract other cells
      let fieldIndex = 1;
      for (let i = 1; i < cells.length && fieldIndex < 6; i++) {
        const text = cells[i].textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
          record[`field_${fieldIndex}`] = text;
          fieldIndex++;
        }
      }

      relatedRecords.push(record);
    });
  });

  return relatedRecords;
}

// Extract from detail page
function extractFromDetailPage() {
  const record = {};

  // Get ID from URL
  const urlMatch = window.location.pathname.match(/\/r\/([^/]+)\/(\w+)/);
  if (urlMatch) {
    record.id = urlMatch[2];
  } else {
    record.id = 'id_' + Math.random().toString(36).substr(2, 9);
  }

  console.log('[SF Extractor] Extracting detail page, ID:', record.id);

  // Get title/name
  const titleElement = document.querySelector('h1, [data-testid="title"], .pageTitle, .slds-page-header__title');
  if (titleElement) {
    record.name = titleElement.textContent?.trim().split('\n')[0] || '';
  }

  // Strategy 1: Extract from field sections with data-label
  const fieldSections = document.querySelectorAll('[data-label]');
  const extracted = {};

  fieldSections.forEach((section) => {
    const label = section.getAttribute('data-label');
    if (!label) return;

    // Get the value from the section, filtering out "Edit" buttons/links
    let value = '';
    
    // Try to get specific formatted values first (best for Email, Phone, Currency)
    const formatted = section.querySelector('lightning-formatted-text, lightning-formatted-email, lightning-formatted-phone, lightning-formatted-number, lightning-formatted-name');
    if (formatted) {
      value = formatted.textContent?.trim();
    } else {
      // Walk through child nodes and get text, excluding button text
      const textNodes = [];
      const walker = document.createTreeWalker(
        section,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text && text !== 'Edit' && !text.startsWith('Edit ') && text.length < 300) {
          if (!textNodes.includes(text)) {
            textNodes.push(text);
          }
        }
      }
      value = textNodes.join(' ').trim();
    }

    if (value && value.length > 0 && value.length < 500) {
      const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
      extracted[key] = value;
      console.log(`[SF Extractor] Found field: ${key} = ${value}`);
    }
  });

  Object.assign(record, extracted);


  // Strategy 3: Handle specific required fields mapping if they have different names
  const fieldMap = {
    'name': ['name', 'full_name', 'lead_name', 'contact_name', 'account_name', 'opportunity_name', 'subject'],
    'status': ['status', 'lead_status', 'stage', 'opportunity_stage'],
    'owner': ['owner', 'lead_owner', 'contact_owner', 'account_owner', 'opportunity_owner', 'assigned_to'],
    'email': ['email', 'email_address'],
    'phone': ['phone', 'mobile', 'work_phone']
  };

  for (const [standardKey, options] of Object.entries(fieldMap)) {
    if (!record[standardKey]) {
      for (const opt of options) {
        if (record[opt]) {
          record[standardKey] = record[opt];
          break;
        }
      }
    }
  }

  // Strategy 4: If no fields found, extract from visible text
  if (Object.keys(extracted).length === 0) {
    const title = document.querySelector('h1, [data-testid="title"], .pageTitle');
    if (title) {
      record.name = title.textContent?.trim().split('\n')[0];
    }

    // Find email in page
    const emailLink = Array.from(document.querySelectorAll('a[href^="mailto:"]')).find(el => el.textContent?.includes('@'));
    if (emailLink) record.email = emailLink.textContent?.trim();

    // Find phone in page
    const phoneLink = Array.from(document.querySelectorAll('a[href^="tel:"]')).find(el => el.textContent);
    if (phoneLink) record.phone = phoneLink.textContent?.trim();
  }

  record.extractedAt = Date.now();
  return record;
}

// Extract from list view
function extractFromListView() {
  const records = [];
  const seen = new Set();

  console.log('[SF Extractor] Starting list view extraction...');

  // Find the table
  const table = document.querySelector('table');
  if (!table) {
    console.log('[SF Extractor] No table found');
    return records;
  }

  // Get tbody if it exists, otherwise get direct tr children
  const tbody = table.querySelector('tbody');
  let rows = [];
  if (tbody) {
    rows = Array.from(tbody.querySelectorAll('tr'));
    console.log('[SF Extractor] Found', rows.length, 'rows in tbody');
  } else {
    rows = Array.from(table.querySelectorAll('tr')).slice(1); // Skip header
    console.log('[SF Extractor] Found', rows.length, 'rows (no tbody)');
  }

  if (rows.length === 0) {
    console.log('[SF Extractor] No rows found in table');
    return records;
  }

  rows.forEach((row, rowIndex) => {
    try {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length === 0) {
        console.log(`[SF Extractor] Row ${rowIndex}: No cells found`);
        return;
      }

      console.log(`[SF Extractor] Row ${rowIndex}: ${cells.length} cells`);

      // Get record ID and name from first link
      let id = null;
      let name = null;
      const firstLink = row.querySelector('a');

      if (firstLink && firstLink.href) {
        const href = firstLink.href;
        console.log(`[SF Extractor] Row ${rowIndex}: Found link: ${href}`);
        
        // Extract ID from: /lightning/r/00Qf600000A8RbZEAV/view (ID is 15-18 chars after /r/)
        const matches = href.match(/\/lightning\/r\/([a-zA-Z0-9]{15,18})/);
        if (matches && matches[1]) {
          id = matches[1];
          name = firstLink.textContent?.trim() || '';
          console.log(`[SF Extractor] Row ${rowIndex}: Extracted ID=${id}, Name="${name}"`);
        } else {
          console.log(`[SF Extractor] Row ${rowIndex}: Could not extract ID from href`);
        }
      }

      if (!id) {
        console.log(`[SF Extractor] Row ${rowIndex}: No valid Salesforce ID found, skipping`);
        return;
      }

      if (seen.has(id)) {
        console.log(`[SF Extractor] Row ${rowIndex}: Duplicate ID`);
        return;
      }
      seen.add(id);

      const record = {
        id: id,
        name: name || '',
        extractedAt: Date.now()
      };

      // Extract cell values - one per cell
      cells.forEach((cell, cellIndex) => {
        // Get only direct text content, not from nested elements
        let text = '';
        
        // If cell has a link, get that text
        const link = cell.querySelector('a');
        if (link && cellIndex === 1) {
          text = link.textContent?.trim() || '';
        } else {
          // Use TreeWalker to get text nodes only
          const walker = document.createTreeWalker(
            cell,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          const textParts = [];
          let textNode;
          while (textNode = walker.nextNode()) {
            const content = textNode.textContent?.trim();
            if (content && content.length > 0 && content !== 'Edit' && content !== 'Change') {
              textParts.push(content);
            }
          }
          text = textParts.join(' ').trim();
        }

        // Clean up text
        text = text
          .replace(/\s+/g, ' ')
          .replace(/Edit\s*/g, '')
          .replace(/Change\s*/g, '')
          .trim();

        if (!text || text.length === 0) {
          console.log(`[SF Extractor] Row ${rowIndex}, Cell ${cellIndex}: [empty]`);
          return;
        }

        if (text.length > 150) {
          console.log(`[SF Extractor] Row ${rowIndex}, Cell ${cellIndex}: [too long - ${text.length} chars]`);
          return;
        }

        console.log(`[SF Extractor] Row ${rowIndex}, Cell ${cellIndex}: "${text}"`);

        // Map to fields based on column position
        if (cellIndex === 0) {
          // Checkbox column, skip
          return;
        } else if (cellIndex === 1 && !record.name) {
          record.name = text;
        } else if (cellIndex === 2) {
          record.title = text;
        } else if (cellIndex === 3) {
          record.company = text;
        } else if (cellIndex === 4) {
          // Phone or email
          if (text.includes('@')) {
            record.email = text;
          } else {
            record.phone = text;
          }
        } else if (cellIndex === 5) {
          // Email, source, or owner
          if (text.includes('@')) {
            record.email = text;
          } else {
            record.source = text;
          }
        }
      });

      if (record.name && record.name.length > 0) {
        records.push(record);
        console.log(`[SF Extractor] Row ${rowIndex}: ✓ Extracted`, {
          name: record.name,
          title: record.title || '',
          company: record.company || '',
          phone: record.phone || '',
          email: record.email || '',
          source: record.source || ''
        });
      }
    } catch (error) {
      console.error(`[SF Extractor] Row ${rowIndex}: ERROR`, error.message);
    }
  });

  console.log(`[SF Extractor] Extraction complete: ${records.length} records`);
  return records;
}

// Main extraction function
async function extractData() {
  const objectType = detectObjectType();

  if (!objectType) {
    console.log('[SF Extractor] Could not detect object type');
    return { success: false, error: 'Could not detect Salesforce object type' };
  }

  let records = [];
  let relatedRecords = [];

  try {
    if (isDetailView()) {
      // Extract single record from detail page
      const record = extractFromDetailPage();
      records = [record];
      
      // Also extract related records (Contacts under Account, etc.)
      relatedRecords = extractRelatedRecords();
      
      console.log('[SF Extractor] Extracted from detail page:', record);
      console.log('[SF Extractor] Related records found:', relatedRecords.length);
    } else if (isKanbanView()) {
      // Extract from Kanban/Pipeline view
      records = extractFromKanbanView();
      console.log('[SF Extractor] Extracted from Kanban view:', records.length, 'records');
    } else {
      // Extract from list view with pagination support
      records = await extractWithPagination();
      console.log('[SF Extractor] Extracted from list view (with pagination):', records.length, 'records');
    }

    // Combine related records with main records
    const allRecords = [...records, ...relatedRecords];

    return {
      success: true,
      objectType,
      records: allRecords,
      count: allRecords.length,
      mainRecords: records.length,
      relatedRecords: relatedRecords.length,
    };
  } catch (error) {
    console.error('[SF Extractor] Extraction error:', error);
    return {
      success: false,
      error: error.message || 'Extraction failed'
    };
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[SF Extractor] Message received:', request);
  
  if (request.action !== 'extract') {
    return false;
  }

  try {
    // Check if we're on Salesforce
    const isSalesforceUrl = window.location.href.includes('salesforce.com') || window.location.href.includes('force.com');
    if (!isSalesforceUrl) {
      console.warn('[SF Extractor] Not on Salesforce domain');
      sendResponse({
        success: false,
        error: 'Please open this extension on a Salesforce page (salesforce.com or force.com)'
      });
      return true;
    }

    const objectType = detectObjectType();
    console.log('[SF Extractor] Detected object type:', objectType);
    
    if (!objectType) {
      console.error('[SF Extractor] Could not detect object type from page');
      sendResponse({
        success: false,
        error: 'Unable to detect Salesforce object type. Please make sure you are viewing a Lead, Contact, Account, Opportunity, or Task list or detail page.'
      });
      return true;
    }

    // Show loading indicator
    indicator.showLoading(objectType);
    
    // Extract data (async)
    extractData().then((result) => {
      console.log('[SF Extractor] Extraction result:', result);
      
      // Show success or error indicator
      if (result.success) {
        if (result.count === 0) {
          indicator.showError('No records found on this page');
          sendResponse({
            success: false,
            error: 'No records found. Make sure the page has data to extract.'
          });
        } else {
          indicator.showSuccess(result.objectType, result.count);
          sendResponse(result);
        }
      } else {
        indicator.showError(result.error);
        sendResponse(result);
      }
    }).catch((error) => {
      console.error('[SF Extractor] Async extraction error:', error);
      indicator.showError(error.message || 'Extraction failed');
      sendResponse({ 
        success: false, 
        error: error.message || 'Extraction failed. Please try again.'
      });
    });

    return true; // Keep channel open for async response
  } catch (error) {
    console.error('[SF Extractor] Sync error:', error);
    sendResponse({ 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    });
    return true;
  }
});

console.log('[Salesforce CRM Extractor] Content script loaded');