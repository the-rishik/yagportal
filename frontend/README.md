# NJ YAG React Frontend

This is the React + TypeScript frontend for the New Jersey Youth and Government Bill Submission System.

## Features

- **Modern React with TypeScript**: Type-safe development with modern React patterns
- **Authentication System**: Login/Register with JWT token management
- **Bill Management**: Create, view, and manage bills
- **Admin Dashboard**: User and bill management for administrators
- **Responsive Design**: Mobile-friendly interface
- **Protected Routes**: Role-based access control

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management
- **CSS3** with modern styling

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   └── Navbar.css
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Bills.tsx
│   │   ├── MyBills.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── Contact.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── App.css              # Global styles
│   └── index.tsx            # App entry point
├── public/                  # Static assets
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 3000

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3001](http://localhost:3001) in your browser.

### Running with Backend

From the root directory, you can run both frontend and backend together:

```bash
npm run dev:full
```

This will start:
- Backend server on port 3000
- Frontend development server on port 3001

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## API Configuration

The frontend is configured to communicate with the backend API at `http://localhost:3000/api`. You can modify this in `src/services/api.ts`.

## Authentication

The app uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests.

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation links in `src/components/Navbar.tsx`

### Adding New Components

1. Create the component in `src/components/`
2. Add corresponding CSS file if needed
3. Import and use in your pages

### TypeScript

All components and functions are typed with TypeScript. See `src/types/index.ts` for interface definitions.

## Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `build/` directory, ready for deployment to any static hosting service.

## Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain consistent styling
4. Add proper error handling
5. Test your changes thoroughly
