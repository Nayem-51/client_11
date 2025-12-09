import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/common/Layout";
import { ProtectedRoute, AdminRoute, PublicRoute } from "./ProtectedRoute";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PublicLessons from "../pages/PublicLessons";
import LessonDetails from "../pages/LessonDetails";
import DashboardIndex from "../pages/Dashboard";
import AddLesson from "../pages/Dashboard/AddLesson";
import MyLessons from "../pages/Dashboard/MyLessons";
import MyFavorites from "../pages/Dashboard/MyFavorites";
import AdminPanel from "../pages/Dashboard/Admin";
import ManageLessons from "../pages/Dashboard/Admin/ManageLessons";
import ReportedLessons from "../pages/Dashboard/Admin/ReportedLessons";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import AdminProfile from "../pages/Dashboard/Admin/AdminProfile";
import Profile from "../pages/Profile";
import Pricing from "../pages/Pricing";
import PaymentCancel from "../pages/PaymentCancel";
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "lessons",
        element: <PublicLessons />,
      },
      {
        path: "lessons/:id",
        element: <LessonDetails />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "pricing",
        element: (
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardIndex />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/add-lesson",
        element: (
          <ProtectedRoute>
            <AddLesson />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/my-lessons",
        element: (
          <ProtectedRoute>
            <MyLessons />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/favorites",
        element: (
          <ProtectedRoute>
            <MyFavorites />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/admin",
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        ),
      },
      {
        path: "dashboard/admin/manage-lessons",
        element: (
          <AdminRoute>
            <ManageLessons />
          </AdminRoute>
        ),
      },
      {
        path: "dashboard/admin/profile",
        element: (
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        ),
      },
      {
        path: "dashboard/admin/manage-users",
        element: (
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        ),
      },
      {
        path: "dashboard/admin/reported-lessons",
        element: (
          <AdminRoute>
            <ReportedLessons />
          </AdminRoute>
        ),
      },
      {
        path: "payment/cancel",
        element: <PaymentCancel />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
