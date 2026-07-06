// ============================================
// DEVTOOLS PANEL - Main Scraper Interface
// ============================================

// State management
let selectors = [];
let scrapedData = [];
let pickerActive = false;

// DOM Elements
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
  addSelectorBtn.addEventListener('click', addSelector);
  togglePickerBtn.addEventListener('click', togglePicker);
  scrapeBtn.addEventListener('click', scrapeData);
  exportJsonBtn.addEventListener('click', exportJSON);
  exportXlsxBtn.addEventListener('click', exportXLSX);
  clearDataBtn.addEventListener('click', clearData);
  
  cssSelectorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSelector();
  });
}

// ============================================
// SELECTOR MANAGEMENT
// ============================================

function addSelector() {
  const fieldName = fieldNameInput.value.trim();
  const cssSelector = cssSelectorInput.value.trim();
  
  if (!fieldName || !cssSelector) {
    showStatus('⚠️ Please fill in both field name and CSS selector', 'error');
    return;
  }
  
  if (selectors.some(s => s.fieldName === fieldName)) {
    showStatus('⚠️ Field name already exists', 'error');
    return;
  }
  
  selectors.push({ fieldName, cssSelector });
  saveState();
  renderSelectors();
  
  fieldNameInput.value = '';
  cssSelectorInput.value = '';
  fieldNameInput.focus();
  
  showStatus(`✓ Added "${fieldName}"`, 'success');
}

function removeSelector(fieldName) {
  selectors = selectors.filter(s => s.fieldName !== fieldName);
  saveState();
  renderSelectors();
  showStatus('✓ Selector removed', 'success');
}

function renderSelectors() {
  if (selectors.length === 0) {
    selectorsList.innerHTML = '<li class="empty">No selectors added yet</li>';
    return;
  }
  
  selectorsList.innerHTML = selectors.map((selector, index) => `
    <li>
      <div class="selector-item">
        <div class="selector-field">${selector.fieldName}</div>
        <div class="selector-css">${selector.cssSelector}</div>
      </div>
      <button class="remove-btn" data-index="${index}">✕</button>
    </li>
  `).join('');
  
  // Add event listeners to all remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(btn.getAttribute('data-index'));
      if (index >= 0 && index < selectors.length) {
        removeSelector(selectors[index].fieldName);
      }
    });
  });
}

// ============================================
// VISUAL PICKER
// ============================================

function togglePicker() {
  pickerActive = !pickerActive;
  
  if (pickerActive) {
    togglePickerBtn.classList.add('active');
    togglePickerBtn.textContent = '🎯 Picking... (click element)';
    pickerHint.style.display = 'block';
    showStatus('🎯 Picker active - click an element on the webpage', 'info');
    
    // Get the current inspected page
    const pageTabId = chrome.devtools.inspectedWindow.tabId;
    
    // Send message to content script
    chrome.tabs.sendMessage(pageTabId, { action: 'startPicker' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('❌ Cannot access this page', 'error');
        pickerActive = false;
        togglePickerBtn.classList.remove('active');
        togglePickerBtn.textContent = '🎯 Pick Element on Page';
        pickerHint.style.display = 'none';
      }
    });
  } else {
    disablePicker();
  }
}

function disablePicker() {
  pickerActive = false;
  togglePickerBtn.classList.remove('active');
  togglePickerBtn.textContent = '🎯 Pick Element on Page';
  pickerHint.style.display = 'none';
  
  const pageTabId = chrome.devtools.inspectedWindow.tabId;
  chrome.tabs.sendMessage(pageTabId, { action: 'stopPicker' }).catch(() => {});
}

// Listen for messages from content script (picker)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pickedElement') {
    fieldNameInput.value = request.fieldName || 'Field ' + (selectors.length + 1);
    cssSelectorInput.value = request.selector;
    disablePicker();
    showStatus('✓ Element picked! Review and add selector.', 'success');
    fieldNameInput.focus();
  }
});

// ============================================
// SCRAPING
// ============================================

function scrapeData() {
  if (selectors.length === 0) {
    showStatus('⚠️ Please add at least one selector', 'error');
    return;
  }
  
  scrapeBtn.disabled = true;
  scrapeBtn.textContent = '⏳ Scraping...';
  
  const pageTabId = chrome.devtools.inspectedWindow.tabId;
  
  chrome.tabs.sendMessage(
    pageTabId,
    { action: 'scrape', selectors: selectors },
    (response) => {
      scrapeBtn.disabled = false;
      scrapeBtn.textContent = 'Start Scraping';
      
      if (response && response.success) {
        scrapedData = response.data;
        saveState();
        renderPreview();
        showStatus(`✓ Scraped ${scrapedData.length} items`, 'success');
      } else {
        showStatus('❌ Scraping failed. Check selectors and try again.', 'error');
      }
    }
  );
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
    html += `<p style="color: #5f6368; font-size: 11px; margin: 8px 0 0 0;">... and ${scrapedData.length - maxPreview} more items</p>`;
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
    showStatus('⚠️ No data to export', 'error');
    return;
  }
  
  const jsonStr = JSON.stringify(scrapedData, null, 2);
  downloadFile(jsonStr, 'scraped-data.json', 'application/json');
  showStatus('✓ Exported as JSON', 'success');
}

function exportXLSX() {
  if (scrapedData.length === 0) {
    showStatus('⚠️ No data to export', 'error');
    return;
  }
  
  showStatus('🔄 XLSX export coming soon! (SheetJS integration)', 'info');
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
    showStatus('✓ Data cleared', 'success');
  }
}

function saveState() {
  chrome.storage.local.set({
    selectors: selectors,
    scrapedData: scrapedData
  });
}

function loadState() {
  chrome.storage.local.get(['selectors', 'scrapedData'], (result) => {
    selectors = result.selectors || [];
    scrapedData = result.scrapedData || [];
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
  }, 3500);
}