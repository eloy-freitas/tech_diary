# Brag Document Frontend

React frontend for the Brag Document application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Features

- **Projects**: Manage professional projects with tags, companies, and customers
- **Tasks**: Track detailed tasks with PR links, commands, file paths, and more
- **Companies**: Organize companies you've worked with
- **Customers**: Manage your clients and customers
- **Tags**: Create and manage tags for categorization

## Tech Stack

- React 18
- Vite
- React Router
- Modern CSS with custom design system
- Premium dark theme with glassmorphism effects

## API Configuration

The frontend connects to the backend API at `http://localhost:8000/api`. If you need to change this, update the `API_BASE_URL` in `src/api/client.js`.
