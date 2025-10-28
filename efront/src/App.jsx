import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";

// --- ADD THESE TWO LINES ---
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ---

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const Shop = lazy(() => import("./pages/Shop"));

// (Your PageLoader, NotFound, and ProtectedRoute components remain the same)
// ...
const PageLoader = () => (
  <div className='flex justify-center items-center h-[calc(100vh-80px)]'>
    <p className='text-xl font-semibold text-gray-500 animate-pulse'>
      Loading...
    </p>
  </div>
);

const NotFound = () => (
  <div className='flex flex-col justify-center items-center h-[calc(100vh-150px)] text-center px-4'>
    <h1 className='text-6xl font-bold text-gray-800'>404</h1>
    <p className='text-2xl font-semibold text-gray-600 mt-4'>Page Not Found</p>
    <p className='text-gray-500 mt-2'>
      Sorry, the page you are looking for does not exist.
    </p>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }
  if (!user) {
    return <Navigate to='/login' replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/' replace />;
  }
  return children;
};
// ...

function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    // --- WRAP in a Fragment ---
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='shop' element={<Shop />} />
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path='product/:id' element={<ProductDetails />} />
            <Route path='cart' element={<Cart />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />

            {/* Customer Protected Routes */}
            <Route
              path='orders'
              element={
                <ProtectedRoute allowedRoles={["Customer"]}>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path='profile'
              element={
                <ProtectedRoute allowedRoles={["Customer"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Seller Protected Routes */}
            <Route
              path='seller/dashboard'
              element={
                <ProtectedRoute allowedRoles={["Seller"]}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='seller/product/new'
              element={
                <ProtectedRoute allowedRoles={["Seller"]}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path='seller/product/edit/:id'
              element={
                <ProtectedRoute allowedRoles={["Seller"]}>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>

      {/* --- ADD THIS COMPONENT --- */}
      {/* This renders the toasts on top of all pages */}
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme='light'
      />
    </>
  );
}

export default App;
