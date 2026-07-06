# Web Data Scraper Chrome Extension (DevTools Edition)

A professional Chrome extension that **opens in DevTools** (like webscraper.io) to scrape data from websites using CSS selectors. The extension stays open alongside your webpage, making it easy to pick elements and test selectors in real-time.

## ✨ Key Features

- 🎯 **Visual Element Picker** - Click elements to auto-generate CSS selectors
- 📋 **Manual Selector Input** - Type selectors for advanced control
- 🔍 **Live Preview** - See extracted data before export
- 💾 **JSON Export** - Download scraped data as JSON
- 📊 **XLSX Export** - (Coming soon) Export to Excel spreadsheets
- 💾 **Data Persistence** - Selectors and data saved locally

## 📁 Project Structure

```
chrome-extension/
├── manifest.json          # Extension config (DevTools page registration)
├── devtools.html          # DevTools entry point
├── devtools.js            # Registers the panel in DevTools
├── panel.html             # Main scraper UI (in DevTools panel)
├── panel.css              # DevTools panel styling
├── panel.js               # Panel logic and state management
├── content.js             # Injected into pages (data extraction & picking)
├── background.js          # Service worker (background tasks)
└── README.md              # This file
```

## 🏗️ Architecture

### DevTools Panel (Professional Approach)

Unlike a popup that closes when you interact with the page, this extension **runs as a DevTools panel**:

```
┌─────────────────────────────────────────────┐
│ Chrome Browser - Target Website             │
│ (Website you want to scrape)                │
└─────────────────────────────────────────────┘
                      ↓
         Press F12 or Ctrl+Shift+I
                      ↓
┌─────────────────────────────────────────────┐
│ DevTools Drawer                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Elements │ Console │ **Web Scraper** │...│ │
│ ├─────────────────────────────────────────┤ │
│ │  📋 Define Selectors                    │ │
│ │  🎯 Pick Element on Page                │ │
│ │  🔍 Start Scraping                      │ │
│ │  💾 Export JSON                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Why DevTools Panel?**
- ✅ Panel **never closes** - stays open while you work
- ✅ **Side-by-side workflow** - see webpage and scraper at same time
- ✅ **Direct element access** - picker can instantly select elements
- ✅ **Professional** - same approach as webscraper.io
- ✅ **No losing state** - data and selectors persist

## 🚀 Installation

### Step 1: Get the Files
Download all files from the extension folder to your computer.

### Step 2: Load into Chrome
1. Open Chrome → Press **Ctrl+Shift+M** or go to **chrome://extensions/**
2. **Enable "Developer mode"** (toggle at top right)
3. Click **"Load unpacked"**
4. Select your extension folder
5. ✓ Extension installed!

### Step 3: Start Scraping
1. **Open any website** you want to scrape
2. **Press F12** (or Ctrl+Shift+I) to open DevTools
3. **Click "Web Scraper" tab** in DevTools (appears alongside Console, Sources, etc.)
4. **Start defining selectors** using the picker
5. **Click "Start Scraping"** to extract data
6. **Export as JSON** when done

## 📖 How to Use

### Method 1: Visual Element Picker (Recommended)

1. Click **"🎯 Pick Element on Page"** button
2. Move back to the webpage
3. **Click the element** you want to scrape
4. The CSS selector **auto-generates** in the panel
5. Review it and click **"+ Add Selector"**
6. Repeat for other fields
7. Click **"Start Scraping"** when ready

**Example:**
- Go to https://quotes.toscrape.com/
- Click "Pick Element" → click on a quote text → Selector: `.text` (auto-detected!)
- Click "Pick Element" → click on author name → Selector: `.author` (auto-detected!)
- Click "Start Scraping" → 10 quotes + authors extracted!

### Method 2: Manual CSS Selectors (Advanced)

If you know CSS selectors:

1. **Field Name:** Enter what you're scraping (e.g., "Product Name")
2. **CSS Selector:** Enter the selector (e.g., `.product-title`)
3. Click **"+ Add Selector"**
4. Repeat for all fields
5. Click **"Start Scraping"**

## 📚 CSS Selectors Quick Reference

| Selector | Matches | Example |
|----------|---------|---------|
| `.classname` | Elements with that class | `.product-title` |
| `#idname` | Element with that ID | `#main-price` |
| `tag` | All elements of that type | `h1`, `span`, `a` |
| `parent > child` | Direct children only | `div > span` |
| `[attr="value"]` | By attribute | `[data-id="123"]` |
| `tag.class` | Tag with class | `a.product-link` |

**💡 Pro tip:** Open DevTools (F12) → Right-click element → "Inspect" → Look at the HTML to find classes/IDs

## 🎯 Testing

### Example 1: Scrape Quotes
```
Website: https://quotes.toscrape.com/
Selectors:
  - Field: "Quote"    CSS: ".text"
  - Field: "Author"   CSS: ".author"
Result: 10 quotes with authors
```

### Example 2: Scrape Books
```
Website: https://books.toscrape.com/
Selectors:
  - Field: "Title"    CSS: ".product_pod h2 a"
  - Field: "Price"    CSS: ".price_color"
  - Field: "Rating"   CSS: ".star-rating"
Result: Books with prices and ratings
```

## 💾 Data Storage

- **Where:** Chrome's `chrome.storage.local`
- **What:** Selectors and scraped data
- **When:** Auto-saved after each action
- **Persistence:** Survives browser restart
- **Limit:** ~10MB per extension

## 📤 Export Formats

### JSON (✅ Ready Now)
- Click **"📄 JSON"** button
- Downloads file: `scraped-data.json`
- Format: Array of objects
- Perfect for: APIs, databases, Python scripts

Example:
```json
[
  {
    "Quote": "The way to get started is to quit talking...",
    "Author": "Walt Disney"
  },
  {
    "Quote": "Don't let yesterday take up too much of today.",
    "Author": "Will Rogers"
  }
]
```

### XLSX (📊 Coming Soon)
- Will use SheetJS library
- Creates Excel spreadsheets
- Better for: Non-technical users, spreadsheet analysis

## 🔧 How It Works Behind the Scenes

### File: `manifest.json`
Tells Chrome to:
- Create a DevTools panel (`devtools_page`)
- Inject content script on all websites
- Allow storage and scripting permissions

### Files: `devtools.html` + `devtools.js`
- Entry point when DevTools opens
- Registers the "Web Scraper" panel
- Creates the panel in DevTools UI

### Files: `panel.html` + `panel.css` + `panel.js`
- Main UI for the DevTools panel
- Handles: Selector management, picker toggling, scraping, export
- Communicates with `content.js` via `chrome.tabs.sendMessage()`

### File: `content.js`
- Runs invisibly on every webpage
- Executes CSS selectors to find elements
- Enables visual picker (click highlighting)
- Sends extracted data back to panel

### File: `background.js`
- Background service worker
- Handles future features (XLSX export, scheduled scraping)

## 🐛 Troubleshooting

### "Web Scraper" tab doesn't appear in DevTools
- **Solution:** Reload extension: Go to `chrome://extensions/` → Click refresh icon
- **Check:** DevTools must be open AFTER extension is loaded

### Picker doesn't work / Selectors find nothing
- **Solution:** Check your CSS selector
- **Test:** Open DevTools on target page → Console tab → Type: `document.querySelectorAll('.your-selector')` → Should return elements

### Can't scrape a specific website
- **Reason:** Some sites block content scripts (Gmail, Chrome Web Store, etc.)
- **Solution:** Try a different website to test

### "Cannot access this page" error
- **Reason:** Extension can't access that website
- **Solution:** Try a public website first (quotes.toscrape.com)

## 🔄 Workflow Example

```
1. Open https://quotes.toscrape.com/ in Chrome
2. Press F12 → Click "Web Scraper" tab
3. Click "🎯 Pick Element on Page"
4. On the webpage, click on quote text ".text"
   → Selector auto-generates: "span.text"
5. Back in panel, confirm selector is in field
6. Click "+ Add Selector"
7. Click "🎯 Pick Element on Page" again
8. Click on author name "author"
   → Selector auto-generates: "small.author"
9. Click "+ Add Selector"
10. Now you have 2 selectors active
11. Click "Start Scraping"
12. See preview of 10 quotes + authors
13. Click "📄 JSON" to download file
14. File saved: scraped-data.json
```

## 📝 Next Steps (Phase 2)

- [ ] XLSX export (SheetJS integration)
- [ ] Multi-page scraping (pagination/following links)
- [ ] Selector testing (validate before scraping)
- [ ] Scraping profiles (save/load configurations)
- [ ] Advanced element matching
- [ ] Error handling improvements

## 🛠️ Development

### Making Changes
1. Edit any file
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Changes take effect immediately!

### Debugging
- **DevTools panel:** Right-click extension icon → "Options" → Check logs
- **Content script:** Open target website → F12 → Console tab → See messages
- **Storage:** In DevTools console: `chrome.storage.local.get(null, console.log)`

### File Editing Tips
- `panel.js` and `content.js` have detailed comments
- Each function explains what it does
- Good starting points: `addSelector()`, `scrapeData()`

## 📚 Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [DevTools API Docs](https://developer.chrome.com/docs/extensions/mv3/devtools_panel/)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

## 🙌 Credit

Built as a learning project for web scraping. Inspired by professional tools like webscraper.io.

---

**Questions?** Check the troubleshooting section above or review the code comments!

**Ready to scrape?** Press F12 and start picking elements! 🎯

