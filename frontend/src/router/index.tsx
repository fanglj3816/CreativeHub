import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Home from '../pages/Home';
import CreatePost from '../pages/CreatePost';
import PostDetail from '../pages/PostDetail';
import VocalSeparation from '../pages/audio/VocalSeparation';
import AudioSeparationPage from '../pages/audio/AudioSeparationPage';

// 路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/register',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <Navigate to="/feed" replace />,
  },
  {
    path: '/feed',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/service',
    element: (
      <ProtectedRoute>
        <AudioSeparationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-post',
    element: (
      <ProtectedRoute>
        <CreatePost />
      </ProtectedRoute>
    ),
  },
  {
    path: '/post/:id',
    element: (
      <ProtectedRoute>
        <PostDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/audio/vocal-separation',
    element: (
      <ProtectedRoute>
        <VocalSeparation />
      </ProtectedRoute>
    ),
  },
  {
    path: '/audio/tools/separation',
    element: <Navigate to="/service" replace />,
  },
  {
    path: '/audio/tools/vocal-separation',
    element: (
      <ProtectedRoute>
        <AudioSeparationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

