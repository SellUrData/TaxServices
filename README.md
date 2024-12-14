# Smythe Tax Services Web Application

A comprehensive web application for managing tax services, client relationships, and business operations.

## Features

- Client Portal for document upload and status tracking
- Automated tax preparation workflows
- Secure document management
- Client communication system
- Analytics and reporting dashboard
- Administrative interface
- Chatbot for customer support

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with necessary configurations

### Frontend Setup
1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

## Technology Stack

- Backend: Python Flask
- Frontend: React.js
- Database: SQLite (development) / PostgreSQL (production)
- Authentication: JWT
- UI Framework: Material-UI
