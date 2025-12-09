const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');
const { marked } = require('marked');
const path = require('path');

const PORT = 9051; // IT'S OVER 9000!
const PDF_FILE = 'Matthew_Valancy_Resume.pdf';

// PDF styles (compact for 2-page output)
const PDF_STYLES = `
  :root {
    --teal: #00B5AD;
    --teal-dark: #009c95;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: white; }
  .markdown-body {
    font-size: 11px;
    line-height: 1.4;
    padding: 0.4in;
    max-width: none;
  }
  .markdown-body h1 {
    color: var(--teal);
    border-bottom: 2px solid var(--teal);
    font-size: 20px;
    margin: 0 0 8px 0;
    padding-bottom: 4px;
  }
  .markdown-body h2 {
    color: var(--teal);
    border-bottom: 1px solid var(--teal);
    font-size: 14px;
    margin: 12px 0 6px 0;
    padding-bottom: 2px;
  }
  .markdown-body h3 {
    color: var(--teal-dark);
    font-size: 12px;
    margin: 8px 0 4px 0;
  }
  .markdown-body a { color: var(--teal); }
  .markdown-body hr { border-color: var(--teal); opacity: 0.3; margin: 8px 0; }
  .markdown-body table th { background: var(--teal); color: white; }
  .markdown-body p { margin: 4px 0; }
  .markdown-body ul, .markdown-body ol { margin: 4px 0; padding-left: 20px; }
  .markdown-body li { margin: 2px 0; }
  .markdown-body table { font-size: 10px; margin: 6px 0; }
  .markdown-body table th, .markdown-body table td { padding: 4px 8px; }
  .markdown-body > div[align="center"] { margin-top: 16px; }
  .markdown-body > div[align="center"] em { font-size: 10px; color: #666; }
  .markdown-body h3 { page-break-after: avoid; }
  .markdown-body h3 + p { page-break-before: avoid; }
`;

// Web styles (more spacious for readability)
const WEB_STYLES = `
  :root {
    --teal: #00B5AD;
    --teal-dark: #009c95;
  }
  body {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  .markdown-body {
    font-size: 14px;
    line-height: 1.6;
  }
  .markdown-body h1 {
    color: var(--teal);
    border-bottom: 2px solid var(--teal);
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .markdown-body h2 {
    color: var(--teal);
    border-bottom: 1px solid var(--teal);
    padding-bottom: 4px;
    margin-top: 24px;
  }
  .markdown-body h3 {
    color: var(--teal-dark);
    margin-top: 20px;
  }
  .markdown-body a { color: var(--teal); }
  .markdown-body a:hover { color: var(--teal-dark); }
  .markdown-body hr { border-color: var(--teal); opacity: 0.3; }
  .markdown-body table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .markdown-body table th { background: var(--teal); color: white; padding: 10px 12px; text-align: left; }
  .markdown-body table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
  .markdown-body p { margin: 12px 0; }
  .markdown-body ul, .markdown-body ol { margin: 12px 0; padding-left: 24px; }
  .markdown-body li { margin: 6px 0; }
  .toolbar {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 100;
  }
  .toolbar a, .toolbar button {
    background: var(--teal);
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    text-decoration: none;
    display: inline-block;
  }
  .toolbar a:hover, .toolbar button:hover {
    background: var(--teal-dark);
  }
`;

async function generatePDF() {
  console.log('Generating PDF...');
  const md = fs.readFileSync('README.md', 'utf-8');
  const html = marked.parse(md);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-light.min.css">
  <style>${PDF_STYLES}</style>
</head>
<body>
  <article class="markdown-body">${html}</article>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: PDF_FILE,
    format: 'Letter',
    margin: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
    printBackground: true,
    preferCSSPageSize: false
  });

  await browser.close();
  console.log(`PDF generated: ${PDF_FILE}`);
}

function getWebHtml() {
  const md = fs.readFileSync('README.md', 'utf-8');
  const html = marked.parse(md);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Matthew Valancy - Resume</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-light.min.css">
  <style>${WEB_STYLES}</style>
</head>
<body>
  <div class="toolbar">
    <a href="/download">Download PDF</a>
    <button onclick="location.reload()">Reload (R)</button>
  </div>
  <article class="markdown-body">${html}</article>
  <script>
    document.addEventListener('keydown', e => { if (e.key === 'r') location.reload(); });
  </script>
</body>
</html>`;
}

async function startServer() {
  // Generate PDF on startup
  await generatePDF();

  const server = http.createServer((req, res) => {
    if (req.url === '/download' || req.url === '/pdf') {
      // Serve the PDF file
      const pdfPath = path.join(__dirname, PDF_FILE);
      if (fs.existsSync(pdfPath)) {
        const pdf = fs.readFileSync(pdfPath);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${PDF_FILE}"`,
          'Content-Length': pdf.length
        });
        res.end(pdf);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('PDF not found');
      }
    } else if (req.url === '/regenerate') {
      // Regenerate PDF on demand
      generatePDF().then(() => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('PDF regenerated');
      }).catch(err => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error: ' + err.message);
      });
    } else {
      // Serve the web view (re-reads README.md for live updates)
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getWebHtml());
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const tailscale = Object.values(interfaces).flat()
      .find(i => i && i.family === 'IPv4' && i.address.startsWith('100.'));

    console.log('\n=== Resume Server ===');
    console.log(`Web view:    http://localhost:${PORT}`);
    if (tailscale) console.log(`Tailscale:   http://${tailscale.address}:${PORT}`);
    console.log(`Download:    http://localhost:${PORT}/download`);
    console.log(`Regenerate:  http://localhost:${PORT}/regenerate`);
    console.log('\nPress Ctrl+C to stop');
  });
}

startServer().catch(console.error);
