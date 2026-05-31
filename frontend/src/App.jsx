import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ChannelProvider } from './context/ChannelContext';
import { ProfileProvider } from './context/ProfileContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChannelProvider>
          <ProfileProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#111827',
                  color: '#fff',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  fontSize: '14px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#111827' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#111827' },
                },
              }}
            />
          </ProfileProvider>
        </ChannelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
