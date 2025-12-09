# Resume Tools

This repo hosts Matthew Valancy's resume. The `README.md` **is** the resume - view it directly on GitHub or use the tools below for local development and PDF export.

## How to Get a Job

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#00B5AD' }}}%%
flowchart LR
    A[1. Make Resume] --> B[2. ????]
    B --> C[3. Profit]

    style A fill:#00B5AD,stroke:#009c95,color:#fff
    style B fill:#7e57c2,stroke:#5e35b1,color:#fff
    style C fill:#4caf50,stroke:#388e3c,color:#fff
```

---

## System Overview

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#00B5AD', 'primaryTextColor': '#fff', 'primaryBorderColor': '#009c95', 'lineColor': '#5c6bc0', 'secondaryColor': '#e0f2f1', 'tertiaryColor': '#fff' }}}%%
flowchart LR
    subgraph Source
        README[README.md<br/>Resume Content]
    end

    subgraph Tools
        SCRIPT[show_resume.sh<br/>Launcher]
        NODE[server.js<br/>Node + Puppeteer]
    end

    subgraph Output
        WEB[Web Preview]
        PDF[PDF Export]
    end

    README --> NODE
    SCRIPT --> NODE
    NODE --> WEB
    NODE --> PDF

    style README fill:#00B5AD,stroke:#009c95,color:#fff
    style SCRIPT fill:#7e57c2,stroke:#5e35b1,color:#fff
    style NODE fill:#5c6bc0,stroke:#3f51b5,color:#fff
    style WEB fill:#26a69a,stroke:#00897b,color:#fff
    style PDF fill:#00897b,stroke:#00695c,color:#fff
```

## Request Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e0f2f1', 'primaryTextColor': '#1a1a1a', 'primaryBorderColor': '#00B5AD', 'lineColor': '#00897b', 'secondaryColor': '#e8eaf6', 'tertiaryColor': '#f3e5f5', 'clusterBkg': '#fafafa', 'clusterBorder': '#e0e0e0' }}}%%
flowchart LR
    subgraph Web[Web Preview]
        W1[GET /] --> W2[Read README.md] --> W3[Return HTML]
    end

    subgraph PDF[PDF Download]
        P1[GET /download] --> P2[Read PDF] --> P3[Return file]
    end

    subgraph Regen[Regenerate]
        R1[GET /regenerate] --> R2[Puppeteer render] --> R3[Save PDF]
    end

    style W1 fill:#00B5AD,stroke:#009c95,color:#fff
    style W2 fill:#4db6ac,stroke:#00897b,color:#fff
    style W3 fill:#26a69a,stroke:#00897b,color:#fff
    style P1 fill:#5c6bc0,stroke:#3f51b5,color:#fff
    style P2 fill:#7986cb,stroke:#5c6bc0,color:#fff
    style P3 fill:#5c6bc0,stroke:#3f51b5,color:#fff
    style R1 fill:#7e57c2,stroke:#5e35b1,color:#fff
    style R2 fill:#9575cd,stroke:#7e57c2,color:#fff
    style R3 fill:#7e57c2,stroke:#5e35b1,color:#fff
```

## Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e0f2f1', 'primaryTextColor': '#1a1a1a', 'primaryBorderColor': '#00B5AD', 'lineColor': '#00897b', 'secondaryColor': '#e8f5e9', 'tertiaryColor': '#f3e5f5', 'clusterBkg': '#fafafa', 'clusterBorder': '#e0e0e0' }}}%%
flowchart TB
    subgraph repo[Repository]
        readme[README.md]
        script[show_resume.sh]
        server[server.js]
        pkg[package.json]
    end

    subgraph node_deps[Node Dependencies]
        marked[marked<br/>Markdown Parser]
        puppeteer[puppeteer<br/>Headless Chrome]
    end

    subgraph cdn[CDN Resources]
        ghcss[GitHub Markdown CSS]
    end

    script --> server
    server --> marked
    server --> puppeteer
    server --> ghcss

    style readme fill:#00B5AD,stroke:#009c95,color:#fff
    style script fill:#7e57c2,stroke:#5e35b1,color:#fff
    style server fill:#26a69a,stroke:#00897b,color:#fff
    style pkg fill:#80cbc4,stroke:#4db6ac,color:#1a1a1a
    style marked fill:#b2dfdb,stroke:#80cbc4,color:#1a1a1a
    style puppeteer fill:#b2dfdb,stroke:#80cbc4,color:#1a1a1a
    style ghcss fill:#e0f2f1,stroke:#b2dfdb,color:#1a1a1a
```

---

## Quick Start

```bash
./show_resume.sh
```

That's it. The script installs dependencies if needed and launches the server.

Opens at `http://localhost:9051` with:
- Live web preview (auto-reloads README.md on refresh)
- PDF download button
- `/regenerate` endpoint to rebuild the PDF

---

## Files

| File | Purpose |
|------|---------|
| `README.md` | The resume itself |
| `show_resume.sh` | Launcher script (runs the server) |
| `server.js` | Node server with Puppeteer PDF generation |
| `package.json` | Node dependencies |

## Endpoints (Node Server)

| Route | Description |
|-------|-------------|
| `/` | Live HTML preview of resume |
| `/download` | Download generated PDF |
| `/pdf` | Alias for `/download` |
| `/regenerate` | Rebuild PDF from current README.md |

## PDF Output

The server generates `Matthew_Valancy_Resume.pdf` on startup - this file is gitignored.
