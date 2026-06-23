// ============================================
// BACKGROUND SERVICE WORKER
// ============================================

// This service worker handles background tasks that don't need the popup to be open
// Currently it's minimal - we'll expand it for XLSX export later

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportData') {
    // Future: handle export operations
    sendResponse({ success: true });
  }
});

// Keep-alive: Service workers can unload after 5 minutes of inactivity
// We'll handle this when needed
