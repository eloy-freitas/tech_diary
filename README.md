# Brag Document Application

A full-stack application to track your professional achievements, projects, tasks, companies, customers, and tags for creating comprehensive brag documents.

## 🚀 Features

- **Projects Management**: Track projects with descriptions, tags, associated companies and customers
- **Tasks Tracking**: Document detailed tasks with PR links, important links, commands, file paths, and execution dates
- **Companies**: Manage companies you've worked with
- **Customers**: Organize your clients and customers
- **Tags**: Categorize projects and tasks with custom tags
- **JSON Storage**: Simple file-based storage (easily migrated to database later)
- **Modern UI**: Premium dark theme with glassmorphism effects and smooth animations

## 📁 Project Structure

```
my_tech_diary/
├── backend/          # Python FastAPI backend
│   ├── main.py      # Application entry point
│   ├── models/      # Pydantic data models
│   ├── routes/      # API endpoints
│   ├── storage/     # JSON file storage utilities
│   └── data/        # JSON data files
└── frontend/         # React frontend
    ├── src/
    │   ├── api/     # API client
    │   ├── components/  # React components
    │   └── pages/   # Page components
    └── public/
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Data Models

### Project
- Unique ID, name, description
- Tags (array)
- Company reference
- Customer reference

### Task
- Unique ID, name, description
- PR links (array)
- Important links (array)
- Command commands (array)
- Tags (array)
- Saved file paths (array)
- Date of execution

### Company
- Unique ID, name
- Description (optional)

### Customer
- Unique ID, name
- Description (optional)

### Tag
- Name (unique identifier)

## 🔄 Future Database Migration

The current JSON file structure is designed for easy migration to a database:
- Each model has its own JSON file
- Simple array structure
- Can be imported into PostgreSQL, MongoDB, or other databases
- Update `storage/json_storage.py` to use database ORM

## 🎨 Design Features

- Premium dark theme with vibrant gradients
- Glassmorphism card effects
- Smooth animations and transitions
- Responsive layout
- Modern typography (Inter font)
- Intuitive navigation

## 📝 API Endpoints

All endpoints are prefixed with `/api`

- **Projects**: `/projects` (GET, POST, PUT, DELETE)
- **Tasks**: `/tasks` (GET, POST, PUT, DELETE)
- **Companies**: `/companies` (GET, POST, PUT, DELETE)
- **Customers**: `/customers` (GET, POST, PUT, DELETE)
- **Tags**: `/tags` (GET, POST, DELETE)

## 🧪 Testing

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Create some tags first (they're used by projects and tasks)
4. Create companies and customers (optional)
5. Create projects and tasks
6. Test all CRUD operations

## 📄 License

This project is for personal use in tracking professional achievements.

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!
