# Startify 🚀

Startify is an AI-powered platform designed to bridge the gap between startup founders and venture capital. By combining an intelligent investor-matching engine with financial forecasting and a dedicated fundraising CRM, Startify acts as a strategic operating system for early-stage startups.

## ✨ Core Features

* **AI Investor Matching:** Ingests and processes large datasets of VC profiles to intelligently match founders with the right funds based on thesis, stage, and industry.
* **Fundraising Pipeline (CRM):** A built-in Kanban board to track investor interactions, manage deal flow, and monitor outreach stages seamlessly.
* **Financial Runway Engine:** Real-time financial forecasting and scenario planning to help founders visualize their burn rate and cash out-of-core dates.
* **Smart Pitch Ideation:** Tools to help founders refine their narratives and build structured roadmaps for their pre-seed/seed rounds.

## 🛠 Tech Stack

**Frontend:**
* React 18 + TypeScript
* Vite (Build Tool)
* Tailwind CSS (Styling)
* Lucide React (Icons)
* Framer Motion (Animations)

**Backend:**
* Python 3.12
* FastAPI (High-performance API framework)
* MongoDB + Beanie ODM (Database & Async Object-Document Mapping)
* Motor (Async MongoDB driver)
* Pandas/NumPy (Data processing for the ML matching engine)

## 🚦 Quick Start (Local Development)

### 1. Clone the repository
`bash
git clone https://github.com/YOUR_USERNAME/startify.git
cd startify
\`

### 2. Backend Setup
`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
\`
`
*Create a `.env` file in the `backend` directory and add your `MONGODB_URI`.*
\`
`bash
uvicorn app.main:app --reload
\`

### 3. Frontend Setup
Open a new terminal window:
`bash
cd frontend
npm install
npm run dev
\`

## 🔒 Security
Environment variables and proprietary datasets (like `cleaned_investors.csv`) are strictly ignored via `.gitignore` to protect pipeline intelligence.

---
*Built for founders, by founders.*

