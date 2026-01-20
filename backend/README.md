# Brag Document Backend

Python FastAPI backend for the Brag Document application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `projects.json`
- `tasks.json`
- `companies.json`
- `customers.json`
- `tags.json`

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/{id}` - Get company by ID
- `POST /api/companies` - Create new company
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Tags
- `GET /api/tags` - List all tags
- `GET /api/tags/{name}` - Get tag by name
- `POST /api/tags` - Create new tag
- `DELETE /api/tags/{name}` - Delete tag
