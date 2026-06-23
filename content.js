// ============================================
// CONTENT SCRIPT - Runs on the target website
// ============================================

let pickerActive = false;
let previouslyHighlighted = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    handleScrape(request.selectors, sendResponse);
  } else if (request.action === 'startPicker') {
    enablePicker();
    sendResponse({ success: true });
  } else if (request.action === 'stopPicker') {
    disablePicker();
    sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async response
});

// ============================================
// SCRAPING LOGIC
// ============================================

function handleScrape(selectors, sendResponse) {
  try {
    const data = [];
    
    // Get all possible root elements (assuming repeated items)
    // Strategy: Find the most common parent of all selectors
    const allElements = [];
    
    // Collect all elements matching any selector
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector.cssSelector);
      allElements.push(...Array.from(elements));
    });
    
    if (allElements.length === 0) {
      sendResponse({ success: false, error: 'No elements found' });
      return;
    }
    
    // Strategy: Assume all items are siblings or children of the same container
    // Extract data by finding the closest common ancestor
    
    // Simple approach: iterate through first selector and get all corresponding items
    const firstSelector = selectors[0];
    const primaryElements = document.querySelectorAll(firstSelector.cssSelector);
    
    if (primaryElements.length === 0) {
      sendResponse({ success: false, error: 'No elements found for primary selector' });
      return;
    }
    
    // For each primary element, find related data from other selectors
    primaryElements.forEach((primaryElement) => {
      const item = {};
      
      selectors.forEach(selector => {
        // Find element within the same container or the element itself
        let element = null;
        
        if (primaryElements.length === 1) {
          // Single item page - just use any matching element
          element = document.querySelector(selector.cssSelector);
        } else {
          // Multiple items - look within the parent context
          const parent = primaryElement.closest('[class*="item"], [class*="product"], [class*="card"], [class*="entry"], [class*="row"]');
          if (parent) {
            element = parent.querySelector(selector.cssSelector);
          } else {
            element = primaryElement.querySelector(selector.cssSelector);
            if (!element) {
              element = primaryElement;
            }
          }
        }
        
        if (element) {
          item[selector.fieldName] = extractText(element);
        } else {
          item[selector.fieldName] = '';
        }
      });
      
      // Only add if at least one field has data
      if (Object.values(item).some(v => v)) {
        data.push(item);
      }
    });
    
    sendResponse({ success: true, data: data });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

function extractText(element) {
  if (!element) return '';
  
  // If it's an input, get the value
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    return element.value.trim();
  }
  
  // If it's a link, try to get href attribute too
  if (element.tagName === 'A') {
    return element.textContent.trim() || element.href;
  }
  
  // Otherwise, get text content
  return element.textContent.trim();
}

// ============================================
// VISUAL PICKER
// ============================================

function enablePicker() {
  pickerActive = true;
  document.body.style.cursor = 'crosshair';
  
  // Add overlay styles
  const style = document.createElement('style');
  style.id = 'picker-styles';
  style.textContent = `
    .picker-highlight {
      outline: 2px solid #1a73e8 !important;
      background-color: rgba(26, 115, 232, 0.1) !important;
    }
    body.picker-active * {
      cursor: crosshair !important;
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('picker-active');
  
  // Add event listeners
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('click', handleElementClick, true);
}

function disablePicker() {
  pickerActive = false;
  document.body.style.cursor = 'default';
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('click', handleElementClick, true);
  document.body.classList.remove('picker-active');
  
  const style = document.getElementById('picker-styles');
  if (style) style.remove();
  
  if (previouslyHighlighted) {
    previouslyHighlighted.classList.remove('picker-highlight');
    previouslyHighlighted = null;
  }
}

function handleMouseOver(event) {
  if (!pickerActive) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  
  if (previouslyHighlighted && previouslyHighlighted !== element) {
    previouslyHighlighted.classList.remove('picker-highlight');
  }
  
  element.classList.add('picker-highlight');
  previouslyHighlighted = element;
}

function handleElementClick(event) {
  if (!pickerActive) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const element = event.target;
  const selector = generateSelector(element);
  
  // Send the picked element back to popup
  chrome.runtime.sendMessage({
    action: 'pickedElement',
    selector: selector,
    fieldName: suggestFieldName(element)
  });
  
  disablePicker();
}

// ============================================
// SELECTOR GENERATION
// ============================================

function generateSelector(element) {
  // Try to generate a practical CSS selector
  
  // 1. If element has a unique ID, use it
  if (element.id) {
    return '#' + element.id;
  }
  
  // 2. If element has useful classes, use them
  if (element.className) {
    const classes = element.className.split(' ')
      .filter(c => c && !c.match(/^(active|selected|hover|disabled|loading)/))
      .slice(0, 2);
    
    if (classes.length > 0) {
      return element.tagName.toLowerCase() + '.' + classes.join('.');
    }
  }
  
  // 3. Use tag name with attribute selectors
  if (element.hasAttribute('data-id') || element.hasAttribute('data-test')) {
    const attr = element.hasAttribute('data-id') ? 'data-id' : 'data-test';
    return `${element.tagName.toLowerCase()}[${attr}="${element.getAttribute(attr)}"]`;
  }
  
  // 4. Build a path-based selector
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += '#' + current.id;
      path.unshift(selector);
      break;
    } else if (current.className) {
      const classes = current.className.split(' ').slice(0, 1).join('.');
      if (classes) selector += '.' + classes;
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  // Simplify: return last 3 parts of path
  return path.slice(-3).join(' > ');
}

function suggestFieldName(element) {
  // Try to suggest a sensible field name based on the element
  
  // 1. Check for label association
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent.trim();
  }
  
  // 2. Check for nearby label
  const nearbyLabel = element.closest('label') || element.previousElementSibling?.tagName === 'LABEL' ? element.previousElementSibling : null;
  if (nearbyLabel) {
    return nearbyLabel.textContent.trim();
  }
  
  // 3. Check for title/placeholder
  if (element.placeholder) return element.placeholder;
  if (element.title) return element.title;
  
  // 4. Use element content if short
  const text = element.textContent.trim();
  if (text && text.length < 30) return text;
  
  // 5. Default
  return element.tagName.toLowerCase();
}
