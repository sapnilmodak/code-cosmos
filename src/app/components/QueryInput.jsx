"use client";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const QueryProcessor = forwardRef(({ data, onQueryResult, mode = "csv" }, ref) => {
  const [query, setQuery] = useState("");
  const [queryStats, setQueryStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Expose setQuery method to parent component
  useImperativeHandle(ref, () => ({
    setQuery: (newQuery) => {
      setQuery(newQuery);
    }
  }));

  // Memoize onQueryResult to prevent infinite loops
  const memoizedOnQueryResult = useCallback(onQueryResult, []);

  // Predefined queries for the dropdown
  const predefinedQueries = [
    { label: "Age > 30", value: 'Age > 30' },
    { label: "Salary > 50000", value: 'Salary > 50000' },
    { label: "Name starts with 'A'", value: "Name LIKE 'A%'" },
    { label: "City is 'Mumbai'", value: "City = 'Mumbai'" },
  ];

  // Helper function to handle LIKE pattern matching
  const likeMatch = (value, pattern) => {
    const regexPattern = "^" + pattern.replace(/%/g, ".*").replace(/_/g, ".") + "$";
    const regex = new RegExp(regexPattern, "i");
    return regex.test(value);
  };

  // Parse and evaluate SQL-like queries for CSV
  const parseAndEvaluateQueryForCSV = (query, data) => {
    try {
      const startTime = performance.now();
      
      const whereClause = query.match(/WHERE (.*)/i);
      if (!whereClause) {
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);
        setQueryStats({
          executed: true,
          queryText: query || "SELECT * FROM data",
          resultCount: data.length,
          executionTime,
          successful: true,
          message: `Returned all ${data.length} records`
        });
        return data; // If no WHERE clause, return all data
      }

      const conditions = whereClause[1]
        .split(/\s+AND\s+/i)
        .map((c) => c.trim());

      const result = data.filter((row) => {
        return conditions.every((condition) => {
          if (condition.includes("LIKE")) {
            const [field, value] = condition.split(/LIKE/i).map((s) => s.trim().replace(/['"]/g, ""));
            return likeMatch(row[field], value);
          }

          let [field, operator, value] = condition
            .replace(/['"]/g, "")
            .split(/(<=|>=|=|<|>)/);

          field = field.trim();
          value = isNaN(value) ? value.trim() : parseFloat(value);

          switch (operator) {
            case "=": return row[field] === value;
            case "<": return row[field] < value;
            case ">": return row[field] > value;
            case "<=": return row[field] <= value;
            case ">=": return row[field] >= value;
            default: return false;
          }
        });
      });
      
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      
      // Check if no records found and handle accordingly
      if (result.length === 0) {
        setQueryStats({
          executed: true,
          queryText: query,
          resultCount: 0,
          executionTime,
          successful: true,
          message: `No matching records found. Showing all ${data.length} records instead.`,
          noMatches: true
        });
        return data; // Return the full database if no records match
      } else {
        setQueryStats({
          executed: true,
          queryText: query,
          resultCount: result.length,
          executionTime,
          successful: true,
          message: `Found ${result.length} matching records from ${data.length} total records`,
          noMatches: false
        });
        return result;
      }
    } catch (error) {
      console.error("Query Parsing Error (CSV):", error);
      setQueryStats({
        executed: true,
        queryText: query,
        successful: false,
        message: `Error: ${error.message}. Showing all records instead.`,
        error: error,
        noMatches: true
      });
      return data; // Return the full database on error
    }
  };

  // Execute query on a database (placeholder for actual database call)
  const executeQueryOnDatabase = async (query) => {
    setIsLoading(true);
    try {
      const startTime = performance.now();
      const response = await fetch("/api/runQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Database query failed");

      const result = await response.json();
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      
      // Check if no records found and handle accordingly
      if (result.length === 0) {
        setQueryStats({
          executed: true,
          queryText: query,
          resultCount: 0,
          executionTime,
          successful: true,
          message: "No matching records found. Showing all records instead.",
          noMatches: true
        });
        memoizedOnQueryResult(data, query); // Send both data and query text
      } else {
        setQueryStats({
          executed: true,
          queryText: query,
          resultCount: result.length,
          executionTime,
          successful: true,
          message: `Query returned ${result.length} records`,
          noMatches: false
        });
        memoizedOnQueryResult(result, query); // Send both result and query text
      }
    } catch (error) {
      console.error("Database Query Error:", error);
      setQueryStats({
        executed: true,
        queryText: query,
        successful: false,
        message: `Database error: ${error.message}. Showing all records instead.`,
        error: error,
        noMatches: true
      });
      memoizedOnQueryResult(data, query); // Send both data and query text on error
    } finally {
      setIsLoading(false);
    }
  };

  // Run the query
  const handleQuery = () => {
    setIsLoading(true);
    
    const formattedQuery = query.trim() || "SELECT * FROM data";
    
    setTimeout(() => {
      if (mode === "csv") {
        const result = parseAndEvaluateQueryForCSV(formattedQuery, data);
        memoizedOnQueryResult(result, formattedQuery); // Send both result and query text
      } else if (mode === "database") {
        executeQueryOnDatabase(formattedQuery);
      }
      setIsLoading(false);
    }, 100); // Small delay for UI feedback
  };

  // Handle dropdown selection
  const handleSelectQuery = (e) => {
    setQuery(`SELECT * FROM data WHERE ${e.target.value}`);
  };

  // Clear the query and show all data
  const handleClearQuery = () => {
    setQuery("");
    setQueryStats(null);
    memoizedOnQueryResult(data, ""); // Send empty query text when clearing
  };

  return (
    <div className="query-section">
      <h2 className="section-title">Run Query ({mode.toUpperCase()})</h2>

      {/* Query Dropdown */}
      <div>
        <label className="input-label">Predefined Queries</label>
        <select 
          onChange={handleSelectQuery}
          className="select-input"
        >
          <option value="">Select a Query</option>
          {predefinedQueries.map((q) => (
            <option key={q.value} value={q.value}>
              {q.label}
            </option>
          ))}
        </select>
      </div>

      {/* Query Input Box */}
      <div>
        <label className="input-label">SQL Query</label>
        <textarea
          placeholder="Write a custom SQL-like query: e.g., SELECT * FROM data WHERE Age > 30"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
        />
      </div>

      <div className="button-row">
        <button 
          onClick={handleQuery} 
          disabled={isLoading}
          className="button primary-button"
        >
          {isLoading ? 'Running...' : 'Run Query'}
        </button>
        
        <button 
          onClick={handleClearQuery}
          className="button secondary-button"
        >
          Clear
        </button>
      </div>

      {/* Query Results Stats */}
      {queryStats && (
        <div className={`query-stats ${
          queryStats.successful 
            ? (queryStats.noMatches ? 'warning' : 'success')
            : 'error'
        }`}>
          <div className="stats-header">
            <div className={`status-indicator ${
              queryStats.successful 
                ? (queryStats.noMatches ? 'warning' : 'success') 
                : 'error'
            }`}></div>
            <h3 className="stats-title">Query Results</h3>
          </div>
          
          <div className="stats-content">
            <p><span className="stats-label">Query:</span> {queryStats.queryText}</p>
            {queryStats.successful && (
              <>
                <p>
                  <span className="stats-label">Results:</span> {queryStats.noMatches 
                    ? `0 matching records (showing all ${data.length} records instead)` 
                    : `${queryStats.resultCount} records`}
                </p>
                <p><span className="stats-label">Time:</span> {queryStats.executionTime}ms</p>
              </>
            )}
            <p className="stats-message">
              {queryStats.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

QueryProcessor.displayName = "QueryProcessor";
export default QueryProcessor;