# 🔗 URL Expander – List Infingement

This Node.js script reads a CSV file containing **shortened URLs**, expands them to their **full destination URLs**, and exports the results into:

- A **CSV file** (`expanded_links.csv`)
- An **Excel file** (`Listing Infringement Link.xlsx`)

---

## ✅ Features

- Reads short links from a CSV file (`short_links.csv`)
- Expands each link using HTTP redirection
- Outputs results with the header: `Listing Infringement Link`
- Saves to both `.csv` and `.xlsx` formats

---

## 📦 Requirements

- Node.js v14 or newer
- Internet connection

---

## 🛠️ Installation

1. Clone or download this repository.
2. Install dependencies:

   ```bash
   npm install csv-parser csv-writer axios xlsx
   ```

---

## 📄 Usage Instructions

### 1. Prepare Your Input CSV

Create a file named `short_links.csv` in the root directory with the following format:

```csv
Short Link
https://bit.ly/example1
https://tinyurl.com/example2
```

Make sure the column header is exactly: **Short Link**

---

### 2. Run the Script

Run the application using:

```bash
node index.js
```

---

## 📤 Output Files

After running the script, you will get:

### ✅ `expanded_links.csv`

```csv
Listing Infringement Link
https://example.com/original1
https://anotherdomain.com/page
```

### ✅ `Listing Infringement Link.xlsx`

- Excel version of the same content
- One column: `Listing Infringement Link`

---

## ⚠️ Notes

- If a short URL cannot be resolved, the script logs the error and keeps the original short URL.
- The script follows up to **1 HTTP redirect**.
- Some shortening services may block automated access or require special headers.

---

## 🔄 Reuse

To run the script again:

1. Update `short_links.csv` with new links.
2. Run:

   ```bash
   node index.js
   ```

---

## 🤝 License

MIT – Free to use for personal or commercial projects.
