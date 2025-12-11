# Calisthenics Competition Management System

A complete system for managing calisthenics competitions with a FastAPI backend and React frontend.

## Project Structure

```
cali/
├── backend/          # FastAPI backend
│   ├── app/         # Application code
│   │   ├── activity/     # Activity endpoints
│   │   ├── events/       # Events endpoints
│   │   └── participants/ # Participants endpoints
│   └── utils/       # Database utilities
└── frontend/        # React + Vite frontend
    └── src/         # Source code
        ├── api/          # API integration
        └── components/   # React components
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=calisthenics_db
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
```

4. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Environment Configuration

Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:8000
```

## Features

### Participants Tab
- **List View**: See all registered participants with search functionality
- **Detail View**: View participant profile with complete activity history
- **Create Participant**: Register new participants and assign them to events
- **Activity Tracking**: View all activities across all events for a participant

### Events Tab
- **List View**: Browse all competition events by type
- **Event Detail**: See all participants registered for an event
- **Participant Activities**: View and manage activities for each participant
- **Add/Edit Activity**: Record new attempts with time, weight, reps, and success status

## API Endpoints

### Participants
- `GET /participants/get` - List all participants
- `GET /participants/get/{id}` - Get participant by ID
- `POST /participants/create` - Create new participant
- `PUT /participants/update/{id}` - Update participant

### Events
- `GET /events/get` - List all events
- `GET /events/get/{id}` - Get event by ID
- `POST /events/create` - Create new event

### Activities
- `POST /activity/get_metrics/event_id/{event_id}?participant_id={id}` - Get activities
- `POST /activity/add_activity/` - Add new activity

## Data Models

### Participant
```json
{
  "name": "string",
  "age": 25,
  "gender": "Male",
  "weight": 70.5,
  "phone": "+1234567890",
  "country": "India",
  "state": "Maharashtra",
  "event_id": [1, 2]
}
```

### Event
```json
{
  "name": "Front Lever Hold",
  "description": "Hold position for maximum time",
  "event_type": 3
}
```
Event types are integers referencing the `event_type` table. Available types: `ENDURANCE`, `STREET_LIFTING`, `MAX_HOLDS`, `MAX_REPS`

### Activity
```json
{
  "event_id": 1,
  "participant_id": 1,
  "attempt_id": 1,
  "weight": 20.0,
  "type_of_activity": "PULL_UP",
  "reps": 10,
  "time": 60.5,
  "is_success": true,
  "is_deleted": false
}
```
Activity types: `PULL_UP`, `DIPS`, `SQUAT`, `MUSCLE_UP`, `PUSH_UP`

## Tech Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - Database ORM
- PostgreSQL - Database
- Pydantic - Data validation

### Frontend
- React 19 - UI library
- Vite - Build tool
- Tailwind CSS v4 - Styling
- Axios - HTTP client
- Lucide React - Icons

## Notes

- CORS is enabled for all origins in development (configure for production)
- The frontend expects the API at `http://localhost:8000` by default
- Activity metrics returned vary based on event type

Built for athletes, by athletes 💪
