// components/QueryHistory.jsx
"use client";

import { Clock, Check, Database, FileText } from "lucide-react";

export const QueryHistory = ({ items, onSelect, icon }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const truncateQuery = (query, maxLength = 40) => {
    return query.length > maxLength ? query.substring(0, maxLength) + "..." : query;
  };

  const groupedItems = items.reduce((acc, item) => {
    const dateKey = formatDate(item.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return (
    <div className="history-container">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date} className="history-group">
          <div className="history-date">{date}</div>
          <ul className="history-list">
            {dateItems.map((item, index) => (
              <li key={index} className="history-item">
                <button className="history-button" onClick={() => onSelect(item.query)}>
                  <div className="history-content">
                    <span className="history-icon">{icon}</span>
                    <div className="history-text">
                      <div className="history-title">{item.name || truncateQuery(item.query)}</div>
                      <div className="history-meta">
                        <span className="history-timestamp">{formatTime(item.timestamp)}</span>
                        {item.source && (
                          <span className="history-source">
                            {item.source === "database" ? (
                              <>
                                <Database size={12} /> DB
                              </>
                            ) : (
                              <>
                                <FileText size={12} /> File
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export const HistorySidebar = ({
  sidebarOpen,
  activeTab,
  setActiveTab,
  history,
  savedQueries,
  handleQuerySelect,
}) => {
  if (!sidebarOpen) return null;

  return (
    <aside className="sidebar">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <Clock size={16} /> History
        </button>
        <button
          className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          <Check size={16} /> Saved
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "history" ? (
          <QueryHistory items={history} onSelect={handleQuerySelect} icon={<Clock size={16} />} />
        ) : (
          <QueryHistory
            items={savedQueries.map((sq) => ({
              ...sq,
              timestamp: new Date(),
            }))}
            onSelect={handleQuerySelect}
            icon={<Check size={16} />}
          />
        )}
      </div>
    </aside>
  );
};