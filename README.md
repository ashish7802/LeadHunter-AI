# LeadHunter AI v2 — Sales Intelligence SaaS

**LeadHunter AI** discovers high-intent businesses actively seeking web development, redesign, SaaS, and automation services in target markets (**India 🇮🇳** and **Canada 🇨🇦**).

Powered by **Groq LLaMA 3.3 70B AI Engine** and real-time multi-source public scraping.

---

## ⚡ Key Features

- **Multi-Source Live Public Ingestion**: Real-time signals scraped from Hacker News Algolia Search API, GitHub Public Issues API, and HN JobStream API.
- **Groq LLaMA 3.3 70B AI Engine**: Structured qualification extracting purchase intent, budget clarity, urgency, and location details.
- **Zero Dummy Data**: 100% traceable leads linked directly to real public sources.
- **Live Website Verifier**: HTTP HEAD checks for domain reachability, HTTPS security, and design age signals.
- **Weighted Lead Scoring**: 0–100 multi-factor scoring algorithm tagging leads as *Hot Lead*, *Qualified Lead*, or *Needs Review*.
- **Modern Glassmorphism CRM Dashboard**: Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts analytics, pipeline Kanban board, detail inspector drawer, and CSV/JSON export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphism Design System
- **AI Qualification**: Groq LLaMA 3.3 70B (`llama-3.3-70b-versatile`)
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **Exporting**: CSV & XLSX (SheetJS)

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ashish7802/DesiClientHunter.git
cd DesiClientHunter
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 License
MIT License. Built for enterprise sales intelligence.
