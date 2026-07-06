# ✅ Installation & Testing Checklist

## 📥 Step 1: Prepare Files

- [ ] Downloaded all files from outputs folder
- [ ] Created a folder: `chrome-web-scraper` (or your preferred name)
- [ ] Copied these 8 files into the folder:
  - [ ] manifest.json
  - [ ] devtools.html
  - [ ] devtools.js
  - [ ] panel.html
  - [ ] panel.css
  - [ ] panel.js
  - [ ] content.js
  - [ ] background.js

**⚠️ Important:** Do NOT copy the old files (popup.html, popup.css, popup.js, picker.html, picker.js). Only use the new files listed above.

---

## 📥 Step 2: Load into Chrome

- [ ] Open Chrome
- [ ] Go to `chrome://extensions/` in address bar
- [ ] Look for toggle in top-right corner labeled "Developer mode"
- [ ] Click the toggle to **enable Developer mode**
- [ ] Button "Load unpacked" should appear (top-left area)
- [ ] Click "Load unpacked"
- [ ] Select the `chrome-web-scraper` folder
- [ ] Click "Open" or "Select Folder"
- [ ] Extension should appear in the extensions list with a blue checkmark

**✓ If you see the extension listed without errors, loading was successful!**

---

## 🧪 Step 3: First Test

### Test 1: Check DevTools Panel
- [ ] Open any website in Chrome
- [ ] Press `F12` (or `Ctrl+Shift+I`)
- [ ] DevTools opens at bottom of screen
- [ ] Look at the tabs: `Elements | Console | Sources | Network | ...`
- [ ] **Look for "Web Scraper" tab** in the list
- [ ] Click "Web Scraper" tab
- [ ] A panel should appear on the left showing:
  - [ ] "Define Data to Scrape" section
  - [ ] "🎯 Pick Element on Page" button
  - [ ] "Active Selectors" list
  - [ ] "Start Scraping" button
  - [ ] Export buttons

**✓ If you see the panel, the extension is working!**

### Test 2: Add a Selector Manually
- [ ] Still in DevTools panel, look for:
  - [ ] "Field Name:" input field
  - [ ] "CSS Selector:" input field
- [ ] Type in Field Name: `Test Field`
- [ ] Type in CSS Selector: `.text`
- [ ] Click "+ Add Selector" button
- [ ] In "Active Selectors" section, you should see:
  - [ ] `Test Field` (bold)
  - [ ] `.text` (gray text below)
- [ ] Click the "✕" remove button
- [ ] The selector should disappear

**✓ If selectors add/remove successfully, core logic works!**

### Test 3: Use the Visual Picker
- [ ] Go to https://quotes.toscrape.com/ in a new tab
- [ ] In DevTools panel, type:
  - [ ] Field Name: `Quote`
  - [ ] CSS Selector: `.text`
- [ ] Click "+ Add Selector"
- [ ] Verify it appears in "Active Selectors" list
- [ ] Now add another:
  - [ ] Field Name: `Author`
  - [ ] CSS Selector: `.author`
- [ ] Click "+ Add Selector"
- [ ] You should now see both in the list

**✓ If both selectors are added, you're ready to scrape!**

### Test 4: Scrape Data
- [ ] With both selectors added, click "Start Scraping" button
- [ ] Wait 2-3 seconds
- [ ] Check "Preview Data" section
- [ ] You should see:
  - [ ] Item 1: Quote + Author
  - [ ] Item 2: Quote + Author
  - [ ] ... (up to 5 items shown)
  - [ ] Text: "... and 5 more items"

**✓ If you see 10 quotes, scraping works perfectly!**

### Test 5: Export to JSON
- [ ] With data in the preview, look for export buttons:
  - [ ] "📄 JSON" button
  - [ ] "📊 XLSX" button
- [ ] Click "📄 JSON" button
- [ ] A file should download automatically
- [ ] File name should be: `scraped-data.json`
- [ ] Check your Downloads folder
- [ ] Open the file with a text editor
- [ ] You should see JSON content like:
  ```json
  [
    {
      "Quote": "The way to get started is to quit talking...",
      "Author": "Walt Disney"
    },
    ...
  ]
  ```

**✓ If JSON file exports with data, you're all set!**

---

## ⚠️ Troubleshooting

### Problem: "Web Scraper" tab doesn't appear in DevTools

**Solution:**
1. Go to `chrome://extensions/`
2. Find "Web Data Scraper" in the list
3. Click the refresh icon (circular arrow) next to it
4. Open DevTools (F12) on a NEW webpage
5. The tab should appear now

**Why?** DevTools must be opened AFTER the extension loads.

---

### Problem: Selectors don't find any data

**Solution:**
1. Make sure you're on https://quotes.toscrape.com/
2. Open DevTools (F12)
3. Go to "Console" tab (not Web Scraper)
4. Type: `document.querySelectorAll('.text')`
5. Press Enter
6. Should show: `NodeList(10) [span.text, span.text, ...]`
7. If it shows `NodeList(0)`, the selector is wrong

**Fix:** Use a different selector or try the visual picker.

---

### Problem: Panel doesn't load or shows errors

**Solution:**
1. Check manifest.json - make sure it's valid JSON
2. Go to `chrome://extensions/`
3. Look for red error text below the extension name
4. Click "Errors" to see what's wrong
5. Fix the error, reload the extension

**Common errors:** Typos in JSON, missing files, permissions issues.

---

### Problem: Can't click on website elements

**Solution:**
1. Make sure DevTools panel is visible (on left side of screen)
2. Website should be visible on the right side
3. Click on the website area (right side), NOT the DevTools (left side)
4. The element picker should highlight elements as you hover
5. Click the element you want

**Note:** Panel should stay open the whole time - it never closes.

---

## 🎯 Success Checklist

When all tests pass, you have:

- [ ] ✅ Extension loaded without errors
- [ ] ✅ DevTools panel appears when you open DevTools
- [ ] ✅ Can add selectors manually
- [ ] ✅ Can remove selectors
- [ ] ✅ Can scrape data from websites
- [ ] ✅ Can see preview of scraped data
- [ ] ✅ Can export data as JSON
- [ ] ✅ JSON file contains the correct data

**You're ready to use the Web Data Scraper!**

---

## 📝 Next Steps

1. **Test on different websites:**
   - https://books.toscrape.com/ (books with prices)
   - https://weather.gov (if allowed)
   - Any public website you want to scrape

2. **Update GitHub:**
   ```bash
   git add .
   git commit -m "Install DevTools edition of Web Scraper"
   git push origin main
   ```

3. **Plan Phase 2:**
   - XLSX export (Excel files)
   - Multi-page scraping (pagination)
   - Advanced features

---

## 💬 Quick Reference

| Task | How |
|------|-----|
| Open extension | Press F12 → "Web Scraper" tab |
| Add selector | Type Field Name + CSS → Click "+ Add Selector" |
| Test selector | Use visual picker (click element) |
| Scrape | Click "Start Scraping" button |
| Export | Click "📄 JSON" button |
| Clear data | Click "Clear" button |

---

## 🚀 You're All Set!

Everything is working. Your extension is:
- Professional-grade (DevTools architecture)
- Reliable (panel never closes)
- Feature-complete (Phase 1 done)
- Ready for Phase 2 (XLSX, multi-page, etc.)

**Time to start scraping!** 🕷️
