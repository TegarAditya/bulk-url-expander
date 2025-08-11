const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const axios = require("axios");
const ExcelJS = require("exceljs");

// Input and Output file paths
const inputFilePath = "short_links.csv";
const outputCsvPath = "expanded_links.csv";
const outputXlsxPath = "Listing Infringement Link.xlsx";

// Initialize CSV writer
const csvWriter = createObjectCsvWriter({
  path: outputCsvPath,
  header: [
    { id: "long_link", title: "Listing Infringement Link" },
  ],
});

// Function to expand shortened URLs
async function expandUrl(shortUrl) {
  try {
    const response = await axios.get(shortUrl, { maxRedirects: 1 });
    const expandedUrl = new URL(response.request.res.responseUrl) || shortUrl;
    return "https://" + expandedUrl.host + expandedUrl.pathname + expandedUrl.search;
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 301 || error.response.status === 302)
    ) {
      return error.response.headers.location;
    }
    console.error(`Error with ${shortUrl}: ${error.message}`);
    return shortUrl;
  }
}

// Function to write XLSX file with custom headers using ExcelJS
async function writeXlsxWithCustomHeaders(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Add header row with style
  worksheet.columns = [
    { header: "Listing Infringement Link", key: "link" },
  ];

  // Style header
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, size: 11 };
  });

  // Add data rows with font size 11
  data.forEach(row => {
    const newRow = worksheet.addRow({ link: row["Listing Infringement Link"] });
    newRow.eachCell((cell) => {
      cell.font = { size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });

  // Save Excel file
  await workbook.xlsx.writeFile(outputXlsxPath);
  console.log("Done writing expanded links to XLSX with custom headers and styling.");
}

// Process the CSV
const processCsv = () => {
  const results = [];
  const promises = [];

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on("data", (row) => {
      const shortLink = row["Short Link"];
      const promise = expandUrl(shortLink).then((longLink) => {
        results.push({ long_link: longLink });
      });
      promises.push(promise);
    })
    .on("end", async () => {
      await Promise.all(promises);
      await csvWriter.writeRecords(results);
      console.log("Done writing expanded links to CSV.");
      const longLinks = results.map((entry) => ({
        "Listing Infringement Link": entry.long_link,
      }));
      await writeXlsxWithCustomHeaders(longLinks);
    });
};

processCsv();
