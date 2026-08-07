import "./globals.css";

export const metadata = {
  title: "PyByte | Learn Python in 5 Minutes a Day",
  description: "A focused Python micro-learning experience on Ludwitt/Hult.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
