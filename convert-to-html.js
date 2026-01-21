const fs = require('fs');
const { marked } = require('marked');
const path = require('path');

const files = [
    'DEPLOYMENT_DOCS.md',
    'PROJECT_DOCUMENTATION.md',
    'IMPLEMENTATION_TASKS.md',
    'NETWORK_DESIGN.md'
];

const htmlTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Rihla Hub</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 3px solid #3b82f6;
    }
    
    h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1e293b;
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #334155;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      margin-bottom: 1rem;
      color: #475569;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 2rem;
      font-size: 0.9rem;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border: 1px solid #e2e8f0;
    }
    
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #1e293b;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.85em;
      color: #e11d48;
    }
    
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0 2rem;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    
    pre code {
      background: none;
      color: #e2e8f0;
      padding: 0;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      color: #475569;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 2rem 0;
    }
    
    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #64748b;
      font-style: italic;
    }
    
    .header-logo {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .header-logo img {
      height: 60px;
    }
    
    .document-info {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    
    .document-info h1 {
      color: white;
      border-bottom: none;
      margin-bottom: 0.5rem;
    }
    
    .document-info p {
      color: rgba(255,255,255,0.9);
      margin: 0;
    }
    
    @media print {
      body { padding: 20px; }
      pre { white-space: pre-wrap; }
      .document-info { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="document-info">
    <h1>Rihla Hub - ${title}</h1>
    <p>Enterprise Cloud Platform Documentation</p>
  </div>
  ${content}
  <hr>
  <p style="text-align: center; color: #94a3b8; font-size: 0.875rem;">
    © 2026 Rihla Technologies | Generated on ${new Date().toLocaleDateString()}
  </p>
</body>
</html>
`;

const backupDir = './BACKUP_20260119_0056';
const pdfDir = path.join(backupDir, 'PDF');

if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
}

files.forEach(file => {
    const filePath = path.join(backupDir, file);
    if (fs.existsSync(filePath)) {
        const markdown = fs.readFileSync(filePath, 'utf8');
        const html = marked(markdown);
        const title = file.replace('.md', '').replace(/_/g, ' ');
        const fullHtml = htmlTemplate(title, html);
        const outputPath = path.join(pdfDir, file.replace('.md', '.html'));
        fs.writeFileSync(outputPath, fullHtml);
        console.log(`Created: ${outputPath}`);
    }
});

console.log('\\nAll HTML files created! Open them in browser and print to PDF.');
