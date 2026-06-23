// State management
let selectors = [];
let scrapedData = [];
let pickerMode = false;

// DOM Elements
const targetUrlInput = document.getElementById('targetUrl');
const openPageBtn = document.getElementById('openPageBtn');
const fieldNameInput = document.getElementById('fieldName');
const cssSelectorInput = document.getElementById('cssSelector');
const addSelectorBtn = document.getElementById('addSelectorBtn');
const togglePickerBtn = document.getElementById('togglePickerBtn');
const pickerHint = document.getElementById('pickerHint');
const selectorsList = document.getElementById('selectorsList');
const scrapeBtn = document.getElementById('scrapeBtn');
const previewContainer = document.getElementById('previewContainer');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportXlsxBtn = document.getElementById('exportXlsxBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const statusMessage = document.getElementById('statusMessage');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  attachEventListeners();
  renderSelectors();
});

function attachEventListeners() {
  openPageBtn.addEventListener('click', openTargetUrl);
  addSelectorBtn.addEventListener('click', addSelector);
  togglePickerBtn.addEventListener('click', togglePicker);
  scrapeBtn.addEventListener('click', scrapeData);
  exportJsonBtn.addEventListener('click', exportJSON);
  exportXlsxBtn.addEventListener('click', exportXLSX);
  clearDataBtn.addEventListener('click', clearData);
  
  // Enter key for selector inputs
  cssSelectorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSelector();
  });
}

// ============================================
// URL MANAGEMENT
// ============================================

function openTargetUrl() {
  const url = targetUrlInput.value.trim();
  if (!url) {
    showStatus('Please enter a URL', 'error');
    return;
  }
  
  // Ensure URL has protocol
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = 'https://' + url;
  }
  
  chrome.tabs.create({ url: fullUrl });
  showStatus('Opening page...', 'info');
}

// ============================================
// SELECTOR MANAGEMENT
// ============================================

function addSelector() {
  const fieldName = fieldNameInput.value.trim();
  const cssSelector = cssSelectorInput.value.trim();
  
  if (!fieldName || !cssSelector) {
    showStatus('Please fill in both field name and CSS selector', 'error');
    return;
  }
  
  // Check for duplicates
  if (selectors.some(s => s.fieldName === fieldName)) {
    showStatus('Field name already exists', 'error');
    return;
  }
  
  selectors.push({ fieldName, cssSelector });
  saveState();
  renderSelectors();
  
  // Clear inputs
  fieldNameInput.value = '';
  cssSelectorInput.value = '';
  
  showStatus(`Added "${fieldName}"`, 'success');
}

function removeSelector(fieldName) {
  selectors = selectors.filter(s => s.fieldName !== fieldName);
  saveState();
  renderSelectors();
  showStatus('Selector removed', 'success');
}

function renderSelectors() {
  if (selectors.length === 0) {
    selectorsList.innerHTML = '<li class="empty">No selectors added yet</li>';
    return;
  }
  
  selectorsList.innerHTML = selectors.map(selector => `
    <li>
      <div class="selector-item">
        <div class="selector-field">${selector.fieldName}</div>
        <div class="selector-css">${selector.cssSelector}</div>
      </div>
      <button class="remove-btn" onclick="removeSelector('${selector.fieldName}')">Remove</button>
    </li>
  `).join('');
}

// ============================================
// VISUAL PICKER MODE
// ============================================

function togglePicker() {
  pickerMode = !pickerMode;
  
  if (pickerMode) {
    togglePickerBtn.style.backgroundColor = '#ff9800';
    togglePickerBtn.style.color = 'white';
    pickerHint.style.display = 'block';
    showStatus('Picker mode active. Click an element on the page.', 'info');
    
    // Communicate with content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startPicker' });
    });
  } else {
    togglePickerBtn.style.backgroundColor = '';
    togglePickerBtn.style.color = '';
    pickerHint.style.display = 'none';
    showStatus('Picker mode disabled', 'info');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPicker' });
    });
  }
}

// Listen for picker messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pickedElement') {
    fieldNameInput.value = request.fieldName || 'Field ' + (selectors.length + 1);
    cssSelectorInput.value = request.selector;
    pickerMode = false;
    togglePickerBtn.style.backgroundColor = '';
    togglePickerBtn.style.color = '';
    pickerHint.style.display = 'none';
    showStatus('Element picked! Review and add selector.', 'success');
  }
});

// ============================================
// SCRAPING
// ============================================

function scrapeData() {
  if (selectors.length === 0) {
    showStatus('Please add at least one selector', 'error');
    return;
  }
  
  scrapeBtn.disabled = true;
  scrapeBtn.textContent = 'Scraping...';
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'scrape', selectors: selectors },
      (response) => {
        scrapeBtn.disabled = false;
        scrapeBtn.textContent = 'Scrape Data';
        
        if (response && response.success) {
          scrapedData = response.data;
          saveState();
          renderPreview();
          showStatus(`Scraped ${scrapedData.length} items`, 'success');
        } else {
          showStatus('Scraping failed. Check selectors and try again.', 'error');
        }
      }
    );
  });
}

function renderPreview() {
  if (scrapedData.length === 0) {
    previewContainer.innerHTML = '<p class="empty">No data scraped yet</p>';
    return;
  }
  
  const maxPreview = 5;
  const preview = scrapedData.slice(0, maxPreview);
  
  let html = preview.map((item, idx) => `
    <div class="preview-item">
      <strong>Item ${idx + 1}</strong>
      ${Object.entries(item).map(([key, value]) => `
        <div class="preview-field">
          <span class="preview-key">${key}:</span>
          <span class="preview-value">${truncate(value, 50)}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
  
  if (scrapedData.length > maxPreview) {
    html += `<p style="color: #5f6368; font-size: 11px;">... and ${scrapedData.length - maxPreview} more items</p>`;
  }
  
  previewContainer.innerHTML = html;
}

function truncate(str, length) {
  return str && str.length > length ? str.substring(0, length) + '...' : str;
}

// ============================================
// EXPORT
// ============================================

function exportJSON() {
  if (scrapedData.length === 0) {
    showStatus('No data to export', 'error');
    return;
  }
  
  const jsonStr = JSON.stringify(scrapedData, null, 2);
  downloadFile(jsonStr, 'scraped-data.json', 'application/json');
  showStatus('Exported as JSON', 'success');
}

function exportXLSX() {
  if (scrapedData.length === 0) {
    showStatus('No data to export', 'error');
    return;
  }
  
  // For now, show a message. We'll integrate SheetJS next
  showStatus('XLSX export coming soon! (Install SheetJS library)', 'info');
  
  // TODO: Implement with SheetJS library
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// DATA MANAGEMENT
// ============================================

function clearData() {
  if (confirm('Clear all scraped data?')) {
    scrapedData = [];
    saveState();
    renderPreview();
    showStatus('Data cleared', 'success');
  }
}

function saveState() {
  chrome.storage.local.set({
    selectors: selectors,
    scrapedData: scrapedData,
    targetUrl: targetUrlInput.value
  });
}

function loadState() {
  chrome.storage.local.get(['selectors', 'scrapedData', 'targetUrl'], (result) => {
    selectors = result.selectors || [];
    scrapedData = result.scrapedData || [];
    if (result.targetUrl) {
      targetUrlInput.value = result.targetUrl;
    }
    renderSelectors();
    renderPreview();
  });
}

// ============================================
// UI HELPERS
// ============================================

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type}`;
  
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}
