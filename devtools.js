// ============================================
// DEVTOOLS PANEL REGISTRATION
// ============================================

// Create the DevTools panel when DevTools opens
chrome.devtools.panels.create(
  "Scraping CE",           // Panel title
  "images/icon-16.png",    // Icon (optional)
  "panel.html",            // Panel HTML file
  function(panel) {
    // Panel created successfully
    console.log("Web Scraper panel created");
  }
);
