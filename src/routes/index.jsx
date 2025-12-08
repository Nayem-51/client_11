import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { ProtectedRoute, AdminRoute, PublicRoute } from './ProtectedRoute'

// Pages
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import PublicLessons from '../pages/PublicLessons'
import LessonDetails from '../pages/LessonDetails'
import DashboardIndex from '../pages/Dashboard'
import AddLesson from '../pages/Dashboard/AddLesson'
import MyLessons from '../pages/Dashboard/MyLessons'
import MyFavorites from '../pages/Dashboard/MyFavorites'
import AdminPanel from '../pages/Dashboard/Admin'
import Profile from '../pages/Profile'
import Pricing from '../pages/Pricing'
import NotFound from '../pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'lessons',
        element: <PublicLessons />
      },
      {
        path: 'lessons/:id',
        element: <LessonDetails />
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        )
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'pricing',
        element: (
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardIndex />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/add-lesson',
        element: (
          <ProtectedRoute>
            <AddLesson />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/my-lessons',
        element: (
          <ProtectedRoute>
            <MyLessons />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/favorites',
        element: (
          <ProtectedRoute>
            <MyFavorites />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/admin',
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        )
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
])

export const Router = () => {
  return <RouterProvider router={router} />
}

export default Router
