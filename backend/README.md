# WristSight AI Backend

This is the backend API for the WristSight AI application, providing endpoints for X-ray image analysis and patient history.

## Getting Started

### Prerequisites
- Python 3.10+
- pip

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/wristsight_ai.git
   cd wristsight_ai/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at http://localhost:8000.

## API Documentation

When the server is running, access the interactive API documentation at:
- http://localhost:8000/docs
- http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/                      # Main application
│   ├── main.py               # Application entry point
│   ├── config.py             # Configuration settings
│   ├── database.py           # Database connection
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas
│   ├── utils.py              # Utility functions
│   └── routers/              # API routes
│       ├── analysis.py       # Analysis endpoints
│       └── history.py        # History endpoints
├── static/                   # Uploaded and generated files
├── tests/                    # Tests
├── .env                      # Environment variables
└── requirements.txt          # Dependencies
```

## Key Features

1. **X-ray Image Analysis**: Upload and analyze wrist X-rays
2. **Patient History**: View and filter analysis history
3. **Mock Analysis**: Development mode with mock data

## Development

### Testing

Run tests with pytest:
```bash
pytest
```

### Docker

Build and run with Docker:
```bash
docker build -t wristsight-backend .
docker run -p 8000:8000 wristsight-backend
```

## Integration with Frontend

The backend provides REST API endpoints that can be consumed by the frontend application.

## Integration with AI Model

The application is designed to work with either mock data (for development) or a real AI model. When your AI model is ready, set `USE_MOCK=False` in the `.env` file and implement the actual analysis function in `utils.py`.
