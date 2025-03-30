

# CodeCosmos - Technical Documentation

## 🔍 Overview

The CSV Query App is a full-featured web application that allows users to upload, query, and analyze CSV data in a browser-based environment. The application leverages modern web technologies to provide a seamless experience for data exploration without requiring database setup or server-side processing.

## ✨ Key Features

- **File Upload**: Upload and parse CSV files directly in the browser
- **SQL-like Query Language**: Filter and manipulate data using familiar SQL-like syntax
- **Data Visualization**: View results in a responsive, paginated table
- **Dark/Light Mode**: Toggle between visual themes for comfortable viewing
- **Query History**: Save and reuse previous queries
- **Export Functionality**: Download query results as CSV files
- **Pagination**: Handle large datasets efficiently with client-side pagination
- **Demo Databases**: Built-in sample datasets for quick testing

## 🏗️ Technical Architecture

The application is built with Next.js, a React framework that provides server-side rendering capabilities and a structured project layout. The architecture follows these principles:

1. **Client-Side Processing**: All data manipulation happens in the browser to eliminate server dependencies
2. **Component-Based Structure**: Modular components for maintainability and code reuse
3. **State Management**: React's useState and useEffect hooks for managing application state
4. **Custom Query Parser**: A lightweight SQL parser that supports basic filtering operations
5. **Responsive Design**: CSS styling that adapts to different screen sizes
6. **Local Storage**: Persistence of query history between sessions

## 🧩 Main Components

### 1. Home Component (`page.js`)

The main container component that orchestrates:
- Application state management
- Component lifecycle
- UI layout and theme switching
- Data processing pipeline
- History management and pagination

### 2. FileUploader Component

Handles:
- File selection and upload
- CSV parsing and validation
- Initial data loading
- Error handling for malformed files

### 3. QueryProcessor Component

Provides:
- SQL-like query interface
- Predefined query templates
- Query execution and error handling
- Results statistics and feedback

### 4. HistorySidebar Component

Manages:
- Query history storage and retrieval
- History visualization
- Loading saved queries
- Clearing history

## ⚙️ How It Works

### Data Flow Process:

1. **Data Upload**: 
   - CSV files are uploaded and parsed using the browser's FileReader API
   - Data is stored in memory as an array of JavaScript objects

2. **Query Execution**:
   - User writes an SQL-like query (e.g., `SELECT * FROM data WHERE Age > 30`)
   - The query parser converts this into JavaScript filter expressions
   - Results are calculated by applying these filters to the in-memory dataset

3. **Results Display**:
   - Paginated table shows query results with configurable page size
   - Navigation controls allow browsing through large result sets
   - Column headers are automatically generated from the data

4. **History Management**:
   - Successful queries are saved to localStorage
   - History sidebar allows reviewing and reusing past queries
   - History persists between browser sessions

### Performance Optimizations:

- **Chunked Processing**: Large files are processed in chunks to prevent UI freezing
- **Pagination**: Only a subset of rows is rendered at a time to maintain performance
- **Virtualization**: Table rows are efficiently managed for large datasets
- **Memoization**: Prevents unnecessary re-renders with useCallback
- **JSON Compression**: Optional LZ-string compression for storing large datasets

## 🚀 Advanced Features

### Custom Query Language

The application supports a SQL-like syntax with:
- WHERE clauses with multiple conditions
- Comparison operators: =, <, >, <=, >=
- LIKE operator for pattern matching
- AND operator for combining conditions

### Dark Mode

The application uses CSS variables and data attributes to implement a comprehensive theming system that affects all components consistently.

### Query Statistics

After each query execution, the app provides:
- Execution time in milliseconds
- Result count and comparison with total dataset size
- Success/failure status with descriptive messages

## 📋 Implementation Details

- **State Management**: React hooks (useState, useEffect, useRef, useCallback)
- **Styling**: CSS variables for theming and responsive design
- **Data Processing**: JavaScript array methods (filter, map, reduce)
- **Storage**: localStorage for persistent query history
- **Error Handling**: Try/catch blocks with user-friendly error messages
- **UI Enhancements**: Loading indicators, status messages, and visual feedback

This application demonstrates modern web development practices and provides a powerful tool for data exploration directly in the browser without requiring backend infrastructure.
