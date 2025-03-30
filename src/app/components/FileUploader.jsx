// src/app/components/FileUploader.jsx
"use client";

import { useState } from "react";
import Papa from "papaparse";

export default function FileUploader({ onDataLoad, onSaveToHistory }) {
  const [fileName, setFileName] = useState("");
  const [csvData, setCsvData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      complete: (result) => {
        const [headers, ...rows] = result.data;
        if (!headers || headers.length === 0) return;
        const parsedData = rows.map((row) =>
          Object.fromEntries(headers.map((header, i) => [header, row[i]]))
        );
        setCsvData(result.data);
        onDataLoad(parsedData);
        onSaveToHistory(parsedData, file.name);
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  const handleDownload = () => {
    if (!csvData) return;
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Upload CSV File</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {csvData && <button onClick={handleDownload}>Download CSV</button>}
    </div>
  );
}
