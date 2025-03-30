"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import FileUploader from "./components/FileUploader";
import QueryProcessor from "./components/QueryInput";
import { useRouter } from "next/navigation";
import { FixedSizeList as List } from "react-window";
import LZString from "lz-string";
import "../styles/style.css"; // Import the CSS file

// Function to convert JSON to CSV
const jsonToCSV = (jsonData) => {
  if (!jsonData || jsonData.length === 0) return "";

  const headers = Object.keys(jsonData[0]);
  const csvRows = jsonData.map(row =>
    headers.map(header => JSON.stringify(row[header], (key, value) => value ?? '')).join(',')
  );

  return [headers.join(','), ...csvRows].join('\n');
};

// Function to trigger CSV download
const downloadCSV = (data, filename = 'data.csv') => {
  const csvData = jsonToCSV(data);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Custom row renderer for the table
const Row = ({ index, style, data }) => {
  const rowData = data[index];
  return (
    <tr
      style={{width: '100%'}}
      className={index % 2 === 0 ? "row-even" : "row-odd"}
    >
      {Object.values(rowData).map((value, i) => (
        <td key={i} className="table-cell">
          {value}
        </td>
      ))}
    </tr>
  );
};

// Custom component to render virtualized table rows
const VirtualizedTableBody = ({ data }) => {
  return (
    <List
      height={400}
      itemCount={data.length}
      itemSize={60}
      width="100%"
      itemData={data}
    >
      {({ index, style }) => (
        <Row index={index} style={style} data={data} />
      )}
    </List>
  );
};

// History Sidebar Component
const HistorySidebar = ({ isOpen, onClose, queryHistory, onSelectQuery }) => {
  if (!isOpen) return null;
  
  return (
    <div className="history-sidebar">
      <div className="history-header">
        <h2 className="history-title">Query History</h2>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>
      
      <div className="history-content">
        {!queryHistory || queryHistory.length === 0 ? (
          <p className="no-history">No query history available</p>
        ) : (
          <ul className="history-list">
            {queryHistory.map((item, index) => (
              <li key={index} className="history-item">
                <div className="history-item-header">
                  <span className="history-timestamp">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => onSelectQuery(item.query)} 
                    className="button history-load-button"
                  >
                    Load
                  </button>
                </div>
                <pre className="history-query">{String(item.query)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="history-footer">
        <button 
          onClick={() => {
            localStorage.removeItem("queryHistory");
            onClose();
            window.location.reload();
          }}
          className="button clear-button"
        >
          Clear History
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState([]);
  const [queryResult, setQueryResult] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [useDatabase, setUseDatabase] = useState(false);
  const [currentDatabase, setCurrentDatabase] = useState("demo1");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const router = useRouter();
  const queryProcessorRef = useRef(null);

  const demoDatabases = {
    demo1: [
      { ID: 1, Name: "John Doe", Age: 32, City: "Mumbai" },
      { ID: 2, Name: "Jane Doe", Age: 28, City: "Delhi" },
      { ID: 3, Name: "Alice", Age: 45, City: "Bangalore" },
      { ID: 4, Name: "Bob", Age: 35, City: "Mumbai" },
    ],
    demo2: [
      { ID: 5, Name: "Charlie", Age: 40, City: "Pune" },
      { ID: 6, Name: "Eve", Age: 29, City: "Hyderabad" },
      { ID: 7, Name: "Mallory", Age: 38, City: "Chennai" },
      { ID: 8, Name: "Oscar", Age: 31, City: "Kolkata" },
    ],
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Load query history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("queryHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setQueryHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      } catch (error) {
        console.error("Error parsing query history:", error);
        setQueryHistory([]);
      }
    }
  }, []);

  // Reset to first page when query results change
  useEffect(() => {
    setCurrentPage(1);
  }, [queryResult]);

  const handleDataLoad = useCallback((parsedData) => {
    if (Array.isArray(parsedData)) {
      setData([]);
      setQueryResult([]);

      let chunkSize = 5000;
      const processChunks = (index = 0) => {
        if (index < parsedData.length) {
          setData((prevData) => {
            if (index === 0) return parsedData.slice(0, chunkSize);
            return [...prevData, ...parsedData.slice(index, index + chunkSize)];
          });

          setQueryResult((prevData) => {
            if (index === 0) return parsedData.slice(0, chunkSize);
            return [...prevData, ...parsedData.slice(index, index + chunkSize)];
          });

          requestIdleCallback(() => processChunks(index + chunkSize));
        }
      };
      processChunks();
    } else {
      console.error("Invalid data format. Expected an array.", parsedData);
      alert("Error: Invalid CSV format.");
    }
  }, []);

  const compressData = (data) => {
    return LZString.compressToUTF16(JSON.stringify(data));
  };

  const decompressData = (compressedData) => {
    try {
      const decompressed = LZString.decompressFromUTF16(compressedData);
      return JSON.parse(decompressed);
    } catch (e) {
      console.error("Error decompressing data:", e);
      return [];
    }
  };

  const saveToHistory = useCallback((parsedData, fileName) => {
    try {
      const history = JSON.parse(localStorage.getItem("csvHistory") || "[]");
      const newEntry = {
        fileName,
        timestamp: Date.now(),
        data: compressData(parsedData.slice(0, 1000)),
      };

      let updatedHistory = [newEntry, ...history.slice(0, 4)];

      try {
        localStorage.setItem("csvHistory", JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn("Storage limit reached, removing oldest entry.");
        updatedHistory.pop();
        localStorage.setItem("csvHistory", JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Error saving to history:", error);
      alert("Storage limit exceeded. Consider clearing history.");
    }
  }, []);
  
  // Save query to history
  const saveQueryToHistory = (queryText) => {
    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) return;
    
    const newQueryItem = {
      query: queryText,
      timestamp: new Date().toISOString(),
    };
    
    const updatedHistory = [newQueryItem, ...queryHistory].slice(0, 50); // Keep only 50 most recent queries
    setQueryHistory(updatedHistory);
    
    try {
      localStorage.setItem("queryHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving query history:", error);
    }
  };
  
  // Handle query execution and record it in history
  const handleQueryExecution = (results, queryText) => {
    setQueryResult(results);
    if (queryText && typeof queryText === 'string' && queryText.trim()) {
      saveQueryToHistory(queryText);
    }
  };
  
  // Handler for selecting a query from history
  const handleSelectQuery = (queryText) => {
    if (queryProcessorRef.current) {
      queryProcessorRef.current.setQuery(queryText);
    }
    setShowHistory(false);
  };
  
  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return queryResult.slice(startIndex, endIndex);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(queryResult.length / rowsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleLoadDemo = (demoName) => {
    const demoData = demoDatabases[demoName] || [];
    setData(demoData);
    setQueryResult(demoData);
    setCurrentDatabase(demoName);
  };

  return (
    <main className="main">
      <div className={`container ${showHistory ? 'with-sidebar' : ''}`}>
        <header className="header">
          <h1 className="title">CodeCosmos </h1>
          <div className="button-group">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="button"
            >
              {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>
            <button 
              onClick={() => setShowHistory(prev => !prev)} 
              className={`button ${showHistory ? 'active' : ''}`}
            >
              {showHistory ? "Hide History" : "History"}
            </button>
            <button
              onClick={() => setUseDatabase((prev) => !prev)}
              className="button"
            >
              {useDatabase ? "Query CSV" : "Query Database"}
            </button>
          </div>
        </header>

        <div className="grid">
          <div className="card">
            <div className="margin-bottom">
              <button
                onClick={() => setUseDatabase((prev) => !prev)}
                className="button"
              >
                {useDatabase ? "Query CSV" : "Query Database"}
              </button>
            </div>

            {useDatabase ? (
              <div className="database-selector">
                <div className="selector-controls">
                  <span className="label">Database:</span>
                  <select
                    value={currentDatabase}
                    onChange={(e) => setCurrentDatabase(e.target.value)}
                    className="select-input"
                  >
                    {Object.keys(demoDatabases).map((db) => (
                      <option key={db} value={db}>
                        {db}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      downloadCSV(
                        demoDatabases[currentDatabase],
                        `${currentDatabase}.csv`
                      )
                    }
                    className="button"
                  >
                    <span>Download CSV</span>
                  </button>
                </div>
                <div className="info-text">
                  Currently using{" "}
                  <span className="bold">{currentDatabase}</span> sample
                  database with {demoDatabases[currentDatabase].length} records.
                </div>
              </div>
            ) : (
              <FileUploader
                onDataLoad={handleDataLoad}
                onSaveToHistory={saveToHistory}
              />
            )}
          </div>

          <div className="card">
            <h2 className="section-title">Query Data</h2>
            <QueryProcessor
              ref={queryProcessorRef}
              data={useDatabase ? demoDatabases[currentDatabase] : data}
              onQueryResult={handleQueryExecution}
            />
          </div>
        </div>

        {Array.isArray(queryResult) && queryResult.length > 0 && (
          <div className="results-container">
            <div className="results-header">
              <h2 className="section-title">
                Results ({queryResult.length} rows)
              </h2>
              <button
                onClick={() => downloadCSV(queryResult, "query_result.csv")}
                className="button"
              >
                Export Results
              </button>
            </div>
            
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing page {currentPage} of {totalPages || 1}
              </div>
              <div className="pagination-actions">
                <select 
                  value={rowsPerPage} 
                  onChange={handleRowsPerPageChange}
                  className="select-input"
                >
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                  <option value={200}>200 rows</option>
                  <option value={500}>500 rows</option>
                </select>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="button pagination-button"
                >
                  Previous
                </button>
                <div className="pagination-pages">
                  {totalPages > 7
                    ? [
                        ...(currentPage > 2 ? [1, "..."] : [1]),
                        ...Array.from(
                          { length: 3 },
                          (_, i) => Math.max(2, Math.min(currentPage - 1 + i, totalPages - 1))
                        ),
                        ...(currentPage < totalPages - 1 ? ["...", totalPages] : [totalPages])
                      ].map((page, i) => (
                        <button
                          key={i}
                          onClick={() => typeof page === "number" && handlePageChange(page)}
                          className={`pagination-page ${currentPage === page ? "active" : ""} ${typeof page !== "number" ? "ellipsis" : ""}`}
                          disabled={typeof page !== "number"}
                        >
                          {page}
                        </button>
                      ))
                    : Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`pagination-page ${currentPage === page ? "active" : ""}`}
                        >
                          {page}
                        </button>
                      ))
                  }
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="button pagination-button"
                >
                  Next
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(queryResult[0] || {}).map((header) => (
                      <th key={header} className="table-header">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData().map((row, index) => (
                    <tr
                      key={index}
                      style={{width: '100%'}}
                      className={index % 2 === 0 ? "row-even" : "row-odd"}
                    >
                      {Object.keys(queryResult[0] || {}).map((header, i) => (
                        <td key={i} className="table-cell">
                          {row[header] !== null && row[header] !== undefined ? 
                            (typeof row[header] === 'object' ? 
                              JSON.stringify(row[header]) : 
                              String(row[header])
                            ) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing rows {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, queryResult.length)} of {queryResult.length}
              </div>
              <div className="pagination-actions">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="button pagination-button"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="button pagination-button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
      
      <HistorySidebar 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        queryHistory={Array.isArray(queryHistory) ? queryHistory : []}
        onSelectQuery={handleSelectQuery}
      />
    </main>
  );
}