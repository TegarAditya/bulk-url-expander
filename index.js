const fs = require("fs");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const axios = require("axios");

// Input and Output file paths
const inputFilePath = "short_links.csv";
const outputFilePath = "expanded_links.csv";

// Initialize CSV writer
const csvWriter = createObjectCsvWriter({
  path: outputFilePath,
  header: [
    { id: "short_link", title: "Short Link" },
    { id: "long_link", title: "Long Link" },
  ],
});

// Function to expand shortened URLs
async function expandUrl(shortUrl) {
  try {
    const response = await axios.get(shortUrl, { maxRedirects: 0 });
    return response.request.res.responseUrl || shortUrl; // Return original if not redirected
  } catch (error) {
    if (error.response) {
      // Handle HTTP redirection (301 or 302)
      if (error.response.status === 301 || error.response.status === 302) {
        return error.response.headers.location; // Return the redirected URL
      }
    } else if (error.request) {
      // If request was made but no response received (e.g., network issues)
      console.error(`No response received for ${shortUrl}: ${error.message}`);
    } else {
      // Other types of errors (e.g., invalid URLs)
      console.error(`Error processing ${shortUrl}: ${error.message} -> ${shortUrl}`);
    }
    return shortUrl; // Return the original short URL in case of failure
  }
}

// Read CSV and process each shortened link
const processCsv = () => {
  const results = [];
  const promises = []; // Array to hold promises

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on("data", (row) => {
      const shortLink = row["Short Link"]; // Assuming your column is named 'Short Link'
      const promise = expandUrl(shortLink).then((longLink) => {
        results.push({ short_link: shortLink, long_link: longLink });
      });
      promises.push(promise); // Add promise to array
    })
    .on("end", async () => {
      // Wait for all promises to resolve before writing the CSV
      await Promise.all(promises);
      csvWriter
        .writeRecords(results)
        .then(() => console.log("Done writing expanded links to CSV."));
    });
};

// Start processing the CSV file
processCsv();
