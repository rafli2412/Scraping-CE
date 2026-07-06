// ============================================
// PICKER MODE - Standalone Window
// ============================================

let pickerActive = false;
let selectedElement = null;
let selectedSelector = null;
let selectedFieldName = null;
let pickerTab = null;

// DOM Elements
const startPickBtn = document.getElementById('startPickBtn');
const resetBtn = document.getElementById('resetBtn');
const useThisBtn = document.getElementById('useThisBtn');
const copyBtn = document.getElementById('copyBtn');
const statusDiv = document.getElementById('statusDiv');
const selectedInfo = document.getElementById('selectedInfo');
const selectorDisplay = document.getElementById('selectorDisplay');
const fieldNameDisplay = document.getElementById('fieldNameDisplay');
const elementTextDisplay = document.getElementById('elementTextDisplay');
const useButtons = document.getElementById('useButtons');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  attachEventListeners();
  getActiveTab();
});

function attachEventListeners() {
  startPickBtn.addEventListener('click', startPicking);
  resetBtn.addEventListener('click', resetPicker);
  useThisBtn.addEventListener('click', useSelector);
  copyBtn.addEventListener('click', copySelector);
}

function getActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      pickerTab = tabs[0];
    }
  });
}

// ============================================
// PICKER CONTROL
// ============================================

function startPicking() {
  if (!pickerTab) {
    updateStatus('❌ No active tab found. Please make sure a webpage is open.', 'error');
    return;
  }

  pickerActive = true;
  startPickBtn.textContent = '⏳ Picking... (check webpage)';
  startPickBtn.disabled = true;
  updateStatus('🎯 Picking mode active! Move to the webpage and click an element.', 'active');

  // Send message to content script to enable picker
  chrome.tabs.sendMessage(pickerTab.id, { action: 'startPicker' }, (response) => {
    if (chrome.runtime.lastError) {
      updateStatus('❌ Cannot access this webpage. Try a different page.', 'error');
      startPickBtn.textContent = '🎯 Start Picking';
      startPickBtn.disabled = false;
      pickerActive = false;
    }
  });

  // Listen for picked element
  chrome.runtime.onMessage.addListener(handlePickedElement);
}

function handlePickedElement(request, sender, sendResponse) {
  if (request.action === 'pickedElement') {
    selectedSelector = request.selector;
    selectedFieldName = request.fieldName || 'Field ' + Date.now();
    selectedElement = request.elementText || '';

    // Update UI
    selectorDisplay.textContent = selectedSelector;
    fieldNameDisplay.textContent = selectedFieldName;
    elementTextDisplay.textContent = selectedElement.substring(0, 100) || '(no text)';

    selectedInfo.classList.add('show');
    useButtons.style.display = 'block';

    startPickBtn.textContent = '🎯 Start Picking Again';
    startPickBtn.disabled = false;
    pickerActive = false;

    updateStatus(
      '✅ Element picked! Review the selector below and click "Use This" to add it to your selectors.',
      'active'
    );

    // Stop picker on the webpage
    chrome.tabs.sendMessage(pickerTab.id, { action: 'stopPicker' });
  }
}

function resetPicker() {
  pickerActive = false;
  selectedElement = null;
  selectedSelector = null;
  selectedFieldName = null;

  selectedInfo.classList.remove('show');
  useButtons.style.display = 'none';
  startPickBtn.textContent = '🎯 Start Picking';
  startPickBtn.disabled = false;

  updateStatus('🔄 Reset. Ready to pick a new element.', 'waiting');

  // Stop picker on webpage
  if (pickerTab) {
    chrome.tabs.sendMessage(pickerTab.id, { action: 'stopPicker' }).catch(() => {});
  }
}

// ============================================
// USE SELECTOR
// ============================================

function useSelector() {
  if (!selectedSelector) {
    updateStatus('❌ No selector selected', 'error');
    return;
  }

  // Send back to popup
  chrome.runtime.sendMessage({
    action: 'addPickedSelector',
    selector: selectedSelector,
    fieldName: selectedFieldName
  }, (response) => {
    if (response && response.success) {
      updateStatus('✅ Selector added to popup! You can pick another or close this window.', 'active');
      setTimeout(() => {
        resetPicker();
      }, 500);
    }
  });
}

function copySelector() {
  if (!selectedSelector) {
    updateStatus('❌ No selector to copy', 'error');
    return;
  }

  navigator.clipboard.writeText(selectedSelector).then(() => {
    updateStatus('📋 Selector copied to clipboard!', 'active');
  }).catch(() => {
    updateStatus('❌ Failed to copy', 'error');
  });
}

// ============================================
// UI HELPERS
// ============================================

function updateStatus(message, type) {
  statusDiv.innerHTML = message;
  statusDiv.className = `status ${type}`;
}
