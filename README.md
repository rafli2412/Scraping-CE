# Web Data Scraper Chrome Extension

A Chrome extension that lets you scrape data from websites using CSS selectors, with both manual and visual picker modes. Export data as JSON or XLSX.

## 📁 Project Structure

```
chrome-extension/
├── manifest.json          # Extension configuration (permissions, scripts, metadata)
├── popup.html             # User interface (UI markup)
├── popup.css              # Styling for popup
├── popup.js               # Popup logic and state management
├── content.js             # Runs on target websites (data extraction)
├── background.js          # Service worker (background tasks)
└── README.md              # This file
```

## 🔧 How It Works

### 1. **manifest.json** - The Blueprint
Tells Chrome:
- What permissions the extension needs (`storage`, `scripting`, `activeTab`)
- Where the popup interface lives (`popup.html`)
- Which scripts run where (`content.js` on all pages, `background.js` in background)
- What websites we can access (`<all_urls>`)

**Key permissions explained:**
- `storage` - Save/load data to browser storage
- `scripting` - Inject and run content scripts
- `activeTab` - Access the current tab
- `<all_urls>` - Work on any website

### 2. **popup.html/css/js** - The User Interface

**What it does:**
- Users enter a target URL
- Users define CSS selectors for data extraction
- Shows a preview of scraped data
- Handles export buttons

**Flow:**
```
User enters URL → Opens that page → Defines selectors → Clicks "Scrape Data"
                                                              ↓
                         popup.js sends message to content.js
                                ↓
                    content.js extracts data from DOM
                                ↓
                    Sends data back to popup
                                ↓
                    Shows preview and allows export
```

**Key functions in popup.js:**
- `addSelector()` - Add a new CSS selector to the list
- `togglePicker()` - Enable/disable visual element picker
- `scrapeData()` - Send message to content script to extract data
- `exportJSON()` - Download data as JSON file
- `exportXLSX()` - (Coming soon) Download as Excel
- `saveState()` / `loadState()` - Persist data across sessions

### 3. **content.js** - The Data Extractor

**What it does:**
- Runs silently on every webpage
- Listens for "scrape" messages from popup
- Executes CSS selectors to find elements
- Extracts text/values from those elements
- Supports visual element picker mode

**Key functions:**
- `handleScrape()` - Extract data matching selectors
- `extractText()` - Get text from different element types
- `enablePicker()` / `disablePicker()` - Visual picker mode
- `generateSelector()` - Auto-generate CSS selector from clicked element

**Data extraction strategy:**
1. Find all elements matching the first selector (primary elements)
2. For each primary element, find related data from other selectors
3. Look within the same container to group related data
4. Return array of objects: `[{fieldName: value, ...}, ...]`

### 4. **background.js** - The Worker

Currently minimal. Will handle:
- Background processing (future)
- XLSX export (future)
- Keep-alive pings (service workers unload after 5 min)

## 🚀 Installation & Testing

### Step 1: Prepare the Extension
```bash
# Create a folder for your extension
mkdir my-web-scraper
cd my-web-scraper

# Copy all files here (manifest.json, popup.*, content.js, background.js)
```

### Step 2: Load into Chrome
1. Open Chrome → Go to `chrome://extensions/`
2. Enable "Developer mode" (toggle at top right)
3. Click "Load unpacked"
4. Select your extension folder
5. Extension icon appears in Chrome toolbar!

### Step 3: Test It

**Example 1: Quote scraper**
- URL: `https://quotes.toscrape.com/`
- Selector 1: Field="Quote", CSS=`.text`
- Selector 2: Field="Author", CSS=`.author`
- Click "Scrape Data"
- See 10 quotes with authors!

**Example 2: Product scraper**
- URL: `https://books.toscrape.com/`
- Selector 1: Field="Title", CSS=`.product_pod h2 a`
- Selector 2: Field="Price", CSS=`.price_color`
- Scrape and export

## 📋 CSS Selector Basics

CSS selectors are how you tell the extension what to extract:

| Selector | Matches | Example |
|----------|---------|---------|
| `.classname` | Elements with a class | `.product-title` |
| `#idname` | Element with an ID | `#main-price` |
| `tag` | All elements of that type | `h1`, `span`, `a` |
| `parent > child` | Direct children | `div > span` |
| `[attribute="value"]` | By attribute | `[data-id="123"]` |
| `tag.class` | Tag with class | `a.product-link` |
| `tag#id` | Tag with ID | `h1#title` |

**Finding selectors:**
1. Open website in Chrome
2. Right-click element → "Inspect" (Developer Tools)
3. Look at the HTML structure
4. Build your selector
5. Copy into popup

**Test selectors:**
In DevTools console, type: `document.querySelectorAll('.your-selector')` 
Should return the elements you want!

## 🎯 Visual Picker Mode

Instead of typing selectors:
1. Click "🎯 Pick Element" button
2. Move mouse over the page - elements highlight in blue
3. Click the element you want to extract
4. Selector auto-generates! Review it, add to list

**Why visual picker?**
- Fast way to find the right selector
- No need to inspect HTML manually
- Less typing, fewer mistakes

## 💾 Data Storage

Data is stored in `chrome.storage.local`:
- Survives browser restarts
- Only accessible to your extension
- Persists until user clears extension data
- Limited to ~10MB per extension

Stored as JSON in:
```javascript
{
  "selectors": [
    { "fieldName": "Product Name", "cssSelector": ".title" },
    ...
  ],
  "scrapedData": [
    { "Product Name": "Widget A", "Price": "$19.99" },
    ...
  ],
  "targetUrl": "https://example.com"
}
```

## 📊 Export Features

### JSON Export ✅ (Working)
- Downloads file as `scraped-data.json`
- Readable, portable, easy to import into other tools
- Format: Array of objects

### XLSX Export 🔄 (Coming Soon)
- Will use SheetJS library
- Creates Excel spreadsheet
- Better for non-technical users

## 🐛 Troubleshooting

**Extension doesn't appear:**
- Reload extension: `chrome://extensions/` → Click refresh icon
- Check for manifest errors: Red notification on extension card

**"Cannot access this page" error:**
- Some pages block content scripts (Chrome Web Store, gmail.com, etc.)
- Works on public websites and most web apps
- Try a different website

**Selectors find nothing:**
- Check selector syntax (typos, class names)
- Use DevTools console: `document.querySelectorAll('.your-selector')`
- Try the visual picker instead

**Data not saving:**
- Check storage permissions in manifest.json
- Try: `chrome.storage.local.get(null, console.log)` in background script

**Visual picker not working:**
- Make sure page is loaded before clicking "Pick Element"
- Some websites block content scripts - try another site

## 🔄 Message Flow (Communication)

```
popup.js                    content.js              background.js
   ↓                            ↓                         ↓
User clicks "Scrape"   
   │
   └─→ chrome.tabs.sendMessage(action: 'scrape')
        │
        └─→ content.js receives message
            │
            └─→ Runs querySelectorAll on DOM
                │
                └─→ sendResponse(data)
                    │
                    └─→ popup.js receives data
                        │
                        └─→ Displays preview
                            │
                            └─→ User clicks Export
                                │
                                └─→ Downloads file
```

## 📝 Next Steps (Phase 2)

- [ ] XLSX export with SheetJS
- [ ] Multi-page scraping (pagination)
- [ ] Advanced selector testing
- [ ] Save/load scraping configurations
- [ ] Scheduled scraping
- [ ] Error handling improvements

## 🛠️ Development Tips

**Debug popup.js:**
- Popup closes after 1 second usually
- Right-click extension icon → "Inspect popup" keeps it open
- Use `console.log()` to debug

**Debug content.js:**
- Open DevTools on the target page (F12)
- Go to "Console" tab
- Messages from content.js appear here
- Use `chrome://extensions/` to inspect script errors

**Reload extension:**
- After any code change, reload: `chrome://extensions/` → Refresh icon
- Or: Press Ctrl+R on the extensions page

**Storage debugging:**
- In background script console: `chrome.storage.local.get(null, console.log)`
- Shows all stored data

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Content Scripts Guide](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## 📄 License

Open source - modify and share as you like!

---

**Happy scraping!** 🕷️
