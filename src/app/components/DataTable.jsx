// src/app/components/DataTable.jsx
export default function DataTable({ data }) {
    if (!data || data.length === 0) return <p>No data available.</p>;
  
    const headers = Object.keys(data[0]);
  
    return (
      <div>
        <h2>Query Result</h2>
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  