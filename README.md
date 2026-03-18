# ProjectMN - Productivity Analytics & Time Tracking

ProjectMN is a comprehensive productivity analytics and time tracking application that automatically collects work data from Google Sheets, processes it through advanced analytics engines, and provides visual insights through a modern React dashboard.

## 🚀 Features

- **Real-time Data Synchronization** - Automated pipeline to fetch latest Google Sheets data
- **Multi-level Analytics** - Daily, weekly, and monthly productivity metrics and visualizations
- **Streak Tracking** - Monitor current work streaks and personal bests with date ranges
- **Cloud Storage Integration** - Data persistence using AWS S3 for scalability
- **Responsive UI** - Professional interface with resizable panels using Ant Design
- **Direct Sheet Integration** - Embedded Google Sheets iframe for live time entry
- **RESTful API** - FastAPI backend with auto-generated OpenAPI documentation
- **Serverless Ready** - Mangum handler for AWS Lambda deployment compatibility

## 🏗️ Architecture

```
Google Sheets Data
    ↓
[GSheet_TaskDes.py] ← Fetch & Clean Task Descriptions
[GSheet_TimeTracker.py] ← Fetch & Clean Time Tracking Data
    ↓
[Analytics Engines]
    ├─ daily_hours_engine.py
    ├─ weekly_hours_engine.py
    └─ monthly_hours_engine.py
    ↓
[S3 Storage] ← JSON output files
    ↓
[FastAPI Endpoints] ← API Routes
    ↓
[React Frontend] ← Fetch & Display Analytics
```

## 🛠️ Technology Stack

### Frontend (Client)
- **React 19.2** - UI framework with functional components and hooks
- **Vite 7.3** - Fast build tool and development server
- **Ant Design 6.3** - Professional UI component library
- **Recharts 3.8** - Data visualization library
- **React Router DOM 7.13** - Client-side routing
- **React Split & React Resizable Panels** - Responsive layout management
- **React Icons 5.6** - Icon library
- **ESLint 9.39** - Code quality and linting

### Backend (Server)
- **FastAPI 0.135** - Python async web framework
- **Python 3.11+** - Core language
- **gspread 6.2** - Google Sheets API client
- **Pandas 3.0** - Data processing and transformation
- **Google Auth Libraries** - OAuth2 authentication
- **boto3 1.42 & S3** - AWS cloud storage
- **Groq 1.0** - LLM integration
- **Uvicorn 0.41** - ASGI server
- **Mangum 0.21** - AWS Lambda adapter

## 📁 Project Structure

```
ProjectMN/
├── Client/                    # React Frontend
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Dashboard/     # Main dashboard with charts
│   │   │   ├── Header/        # Navigation header
│   │   │   ├── Sidebar/       # Navigation sidebar
│   │   │   └── Tracker/       # Time tracker interface
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── Server/                    # FastAPI Backend
│   ├── Analytics/             # Analytics processing engines
│   │   ├── daily_hours_engine.py
│   │   ├── weekly_hours_engine.py
│   │   └── monthly_hours_engine.py
│   ├── Components/            # Google Sheets integration
│   │   ├── GSheet_TaskDes.py
│   │   └── GSheet_TimeTracker.py
│   ├── config/                # Configuration files
│   ├── SchemaJson/            # JSON schema definitions
│   ├── utils/                 # Utility functions
│   ├── server.py              # Main FastAPI application
│   ├── config_loader.py       # Configuration management
│   └── pyproject.toml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Google Cloud Service Account with Sheets API enabled
- AWS account with S3 bucket
- Groq API key (optional)

### Backend Setup

1. Navigate to the Server directory:
   ```bash
   cd Server
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (create `.env` file):
   ```env
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_s3_bucket_name
   GOOGLE_PROJECT_ID=your_google_project_id
   GROQ_API_KEY=your_groq_api_key
   ```

5. Place Google Service Account credentials in `config/Credentials.json`

6. Run the backend:
   ```bash
   # Development mode
   python -m uvicorn server:app --reload

   # Production mode with network access
   python -m uvicorn server:app --host 0.0.0.0 --port 8000
   ```

Backend will be available at:
- **Local**: `http://127.0.0.1:8000`
- **Network**: `http://192.168.0.7:8000` (adjust IP as needed)
- **API Docs**: `http://127.0.0.1:8000/docs`

### Frontend Setup

1. Navigate to the Client directory:
   ```bash
   cd Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Vite proxy configuration in `vite.config.js` if needed:
   ```javascript
   server: {
     proxy: {
       '/analytics': 'http://127.0.0.1:8000',  // Adjust to your backend URL
     },
   },
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Frontend will be available at Vite's default development server URL (typically `http://localhost:5173`).

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check and storage status |
| `POST` | `/pipeline/run` | Trigger full data processing pipeline |
| `GET` | `/tasks` | Retrieve structured task descriptions |
| `GET` | `/analytics/daily` | Daily productivity analytics |
| `GET` | `/analytics/weekly` | Weekly productivity analytics |
| `GET` | `/analytics/monthly` | Monthly productivity analytics |

## 🔧 Configuration

### Google Sheets Setup

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account and download credentials JSON
4. Share your Google Sheet with the Service Account email
5. Place credentials in `Server/config/Credentials.json`

**Sheet Structure Required:**
- Sheet ID: `1x0CJgCUpj-DDvGyClKXdc9OhBpOwNO9AUIdoZ1nnAvM`
- Worksheets: `Sheet1` (Task Desk), `Time-Tracker`

### AWS S3 Setup

1. Create an S3 bucket
2. Configure bucket permissions for your AWS credentials
3. Set environment variables for AWS access

### Environment Variables

Create a `.env` file in the Server directory with:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Google Configuration
GOOGLE_PROJECT_ID=your-project-id

# Groq API (Optional)
GROQ_API_KEY=your-groq-key
```

## 📈 Data Flow

1. **Data Collection**: Google Sheets integration fetches raw time tracking and task data
2. **Data Processing**: Pandas cleans and standardizes the data
3. **Analytics Generation**: Specialized engines calculate daily, weekly, and monthly metrics
4. **Storage**: Processed JSON files are uploaded to AWS S3
5. **API Serving**: FastAPI endpoints serve the analytics data
6. **Visualization**: React frontend fetches and displays the data using Recharts

## 🚀 Deployment

### Backend Deployment

The backend is configured for deployment on Render.com and includes Mangum for AWS Lambda compatibility.

### Frontend Deployment

Build the frontend for production:

```bash
cd Client
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.).

