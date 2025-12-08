# Lessons App - Complete Project Structure

A modern React application for creating, sharing, and learning lessons with proper authentication, routing, and layout management.

## Project Structure

```
client_11/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── apiClient.js          # Axios configuration & interceptors
│   │   └── endpoints.js          # API endpoint definitions
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx        # Navigation bar with user dropdown
│   │   │   ├── Header.css
│   │   │   ├── Footer.jsx        # Footer with links and social media
│   │   │   ├── Footer.css
│   │   │   ├── Sidebar.jsx       # User sidebar (desktop only)
│   │   │   ├── Sidebar.css
│   │   │   ├── Layout.jsx        # Main layout wrapper
│   │   │   └── Layout.css
│   │   ├── lessons/
│   │   └── dashboard/
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication provider
│   │   └── ThemeContext.jsx      # Theme provider
│   ├── hooks/
│   │   ├── useAuth.js            # Auth hook
│   │   ├── useTheme.js           # Theme hook
│   │   ├── useFetch.js           # Data fetching hook
│   │   └── useProtectedRoute.js  # Protected route hook
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── PublicLessons.jsx
│   │   ├── LessonDetails.jsx
│   │   ├── Profile.jsx
│   │   ├── Pricing.jsx
│   │   ├── NotFound.jsx
│   │   ├── Pages.css
│   │   └── Dashboard/
│   │       ├── index.jsx         # Dashboard home
│   │       ├── AddLesson.jsx
│   │       ├── MyLessons.jsx
│   │       ├── MyFavorites.jsx
│   │       └── Admin/
│   │           └── index.jsx     # Admin panel
│   ├── routes/
│   │   ├── index.jsx             # Route configuration
│   │   └── ProtectedRoute.jsx    # Route protection components
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Features

### Layout Structure
- **Header/Navbar**: 
  - Navigation links (Home, Public Lessons, Add Lesson, My Lessons, Pricing/Upgrade)
  - Conditional Login/Sign Up buttons for unauthenticated users
  - User avatar dropdown with Profile, Dashboard, and Logout options for authenticated users
  
- **Sidebar**: 
  - Visible only on desktop (1024px+)
  - Shows user profile and navigation for authenticated users
  
- **Footer**: 
  - Logo, website name, and description
  - Quick links and legal information
  - Social media links
  - Footer appears on all pages except 404

### Authentication
- Login & Registration pages
- Protected routes for authenticated users
- Admin-only routes
- Public routes for non-authenticated users
- Token management with localStorage

### Providers
- **AuthContext**: Manages user authentication state
- **ThemeContext**: Manages light/dark theme

### Hooks
- `useAuth()`: Access authentication state
- `useTheme()`: Access theme settings
- `useFetch()`: Data fetching utility
- `useProtectedRoute()`: Protect routes from unauthorized access

### Routes
- `/` - Home page
- `/lessons` - Public lessons
- `/lessons/:id` - Lesson details
- `/login` - Login page (public route)
- `/register` - Registration page (public route)
- `/profile` - User profile (protected)
- `/pricing` - Pricing/upgrade page (protected)
- `/dashboard` - Dashboard (protected)
- `/dashboard/add-lesson` - Add new lesson (protected)
- `/dashboard/my-lessons` - My lessons (protected)
- `/dashboard/favorites` - My favorites (protected)
- `/dashboard/admin` - Admin panel (admin only)
- `*` - 404 Not Found page

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000/api
```

## Components

### Header Component
- Displays navigation links
- Shows Login/Sign Up buttons for unauthenticated users
- Displays user avatar dropdown for authenticated users
- Responsive design with mobile-first approach

### Footer Component
- Contains company information
- Quick navigation links
- Legal links (Terms, Privacy, Cookies)
- Social media links with hover effects
- Responsive grid layout

### Layout Component
- Wraps all pages except 404
- Includes Header, Sidebar, and Footer
- Main content area for page content
- Proper spacing and structure

## Styling

- CSS-in-JS approach with separate CSS files
- Responsive design with mobile-first approach
- Color variables for consistent theming
- Utility classes for common styles
- Dark theme support via data attributes

## Security

- Token-based authentication
- Authorization checks on protected routes
- Admin role verification
- Automatic logout on 401 unauthorized responses
- Secure token storage in localStorage

---

Made with ❤️ for Learning
