// src/app/history/page.jsx
"use client";

import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import LZString from "lz-string";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem("csvHistory") || "[]");
      const decompressedHistory = savedHistory.map((entry) => {
        try {
          return {
            ...entry,
            data: JSON.parse(LZString.decompressFromUTF16(entry.data) || "[]"),
          };
        } catch (decompressError) {
          console.warn("Skipping invalid entry:", decompressError);
          return null; // Skip invalid entries
        }
      }).filter(Boolean); // Remove null entries

      setHistory(decompressedHistory);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Failed to load history.");
    }
  }, []);

  return (
    <main>
      <h1>CSV Upload History</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        history.map((entry, index) => (
          <div key={index}>
            <h3>{entry.fileName}</h3>
            <DataTable data={entry.data} />
          </div>
        ))
      )}
    </main>
  );
}
