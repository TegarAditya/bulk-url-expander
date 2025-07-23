const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const axios = require("axios");
const XLSX = require("xlsx");

// Input and Output file paths
const inputFilePath = "short_links.csv";
const outputCsvPath = "expanded_links.csv";
const outputXlsxPath = "Listing Infringement Link.xlsx";

// Initialize CSV writer
const csvWriter = createObjectCsvWriter({
  path: outputCsvPath,
  header: [
    // { id: "short_link", title: "Short Link" },
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

// Function to write XLSX file with custom headers
function writeXlsxWithCustomHeaders(data) {
  // Create array of arrays with custom header
  const worksheetData = [
    ["Listing Infringement Link"], // Custom header row
    ...data.map(row => [row["Listing Infringement Link"]]) // Data rows
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, outputXlsxPath);
  console.log("Done writing expanded links to XLSX with custom headers.");
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
      writeXlsxWithCustomHeaders(longLinks); // write only long links to XLSX
    });
};

processCsv();
