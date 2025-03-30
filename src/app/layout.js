// src/app/layout.jsx
import "../styles/globals.css";

export const metadata = {
  title: "CSV Query App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
