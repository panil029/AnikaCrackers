import './globals.css';

export const metadata = {
  title: 'Simple Cracker Shop',
  description: 'A simple cracker website built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}