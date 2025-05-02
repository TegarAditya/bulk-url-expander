const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const axios = require("axios");
const XLSX = require("xlsx");

// Input and Output file paths
const inputFilePath = "short_links.csv";
const outputCsvPath = "expanded_links.csv";
const outputXlsxPath = "expanded_links.xlsx";

// Initialize CSV writer
const csvWriter = createObjectCsvWriter({
  path: outputCsvPath,
  header: [
    { id: "short_link", title: "Short Link" },
    { id: "long_link", title: "Long Link" },
  ],
});

// Function to expand shortened URLs
async function expandUrl(shortUrl) {
  try {
    const response = await axios.get(shortUrl, { maxRedirects: 0 });
    return response.request.res.responseUrl || shortUrl;
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

// Function to write XLSX file
function writeXlsx(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expanded Links");
  XLSX.writeFile(workbook, outputXlsxPath);
  console.log("Done writing expanded links to XLSX.");
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
        results.push({ short_link: shortLink, long_link: longLink });
      });
      promises.push(promise);
    })
    .on("end", async () => {
      await Promise.all(promises);
      await csvWriter.writeRecords(results);
      console.log("Done writing expanded links to CSV.");
      writeXlsx(results); // write to XLSX
    });
};

processCsv();
