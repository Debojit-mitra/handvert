# Handvert

<p align="center">
<img src="https://i.ibb.co/3YMZ1TsR/Screenshot-From-2026-03-28-12-25-06-Photoroom.png" alt="Handvert" width="300" >
</p>

A lightning-fast, private document and image conversion engine. Your files are processed locally on your server/machine—no third-party cloud streaming or external SaaS dependencies.

## Supported Conversions

- **Office to PDF**: Convert docx, pptx, and xlsx to clean PDFs via a headless LibreOffice engine.
- **PDF to DOCX**: Translate PDFs back into editable Word documents using native Python processes.
- **Image Transcoding**: Rapidly crunch heavy formats (including Apple's native `.heic` and `.heif`) into optimized `webp`, `png`, or `jpeg` formats.
  - Includes advanced controls for quality tuning and dynamic pixel/percent layer resizing with aspect-ratio locking.

## Architecture

- **Core**: Next.js 16 (Pages Router) seamlessly tying together the frontend UI and Node.js backend endpoints inside `/api/convert`.
- **System Engines**:
  - Gotenberg (Dockerized LibreOffice wrapper) for document rendering.
  - Node `sharp` for C-level image manipulation.
  - Python `pdf2docx` bridging child processes.
- **Styling**: Tailwind CSS v4 combined with Framer Motion for micro-interactions.

---

## Local Setup

### 1. Node Dependencies

Install the primary Next.js ecosystem and backend parsing libraries (`formidable`, `sharp`):

```bash
npm install
```

### 2. Boot the Office Engine

Gotenberg runs independently in the background to handle Office calculations. Spin up the container:

```bash
sudo docker compose up -d
```

_(Maps Gotenberg to port 3001 to prevent Node collisions)_

### 3. Setup the Python Environment

The Next.js API dynamically spawns a child process for PDF translation. It specifically tracks a local virtual environment named `venv` in the root folder to avoid system Python pollution:

```bash
python3 -m venv venv
./venv/bin/pip install pdf2docx
```

### 4. Start Development

Run the Next.js server with Turbopack:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.
