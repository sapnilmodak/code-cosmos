// src/app/components/DownloadButton.jsx
"use client";

import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const DownloadButton = ({ data }) => {
  const downloadCSV = () => {
    const headers = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Button icon={<DownloadOutlined />} onClick={downloadCSV} style={{ marginLeft: "10px" }}>
      Download CSV
    </Button>
  );
};

export default DownloadButton;
