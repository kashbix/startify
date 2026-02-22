# STRATA-AI Backend

FastAPI backend for the STRATA-AI startup survival and strategy assistant.

## Tech Stack

- **Framework:** FastAPI
- **Database:** MongoDB Atlas
- **ODM:** Beanie
- **Authentication:** JWT (python-jose) + bcrypt

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and secret key
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

### 5. Access API

- **API:** http://127.0.0.1:8000
- **Docs:** http://127.0.0.1:8000/docs
- **Health:** http://127.0.0.1:8000/health

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message |
| `/health` | GET | Health check |
| `/api/v1/auth/register` | POST | User registration |
| `/api/v1/auth/login` | POST | User login (JWT) |

## Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/  # API routes
│   ├── core/              # Config & security
│   ├── db/                # Database connection
│   ├── models/            # MongoDB models
│   ├── schemas/           # Pydantic schemas
│   └── services/          # Business logic
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```
