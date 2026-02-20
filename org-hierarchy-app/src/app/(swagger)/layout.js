// app/(swagger)/layout.js
export const metadata = {
  title: 'Swagger Docs',
};

export default function SwaggerLayout({ children }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }
          body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            font-family: system-ui, sans-serif;
            background: #f9fafb;
          }
          main {
            flex: 1;
          }
        `}</style>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
