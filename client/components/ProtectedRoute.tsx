import { ReactNode, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated] = useState(() => {
    // Check if user is logged in (in real app, check token from localStorage)
    return localStorage.getItem('admin_token') === 'your-secure-token';
  });

  // Login Component
  const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Hardcoded credentials (in real app, verify against backend)
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('admin_token', 'your-secure-token');
        window.location.reload();
      } else {
        setError('Username atau password salah');
      }
      
      setIsLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <h2 className="text-3xl font-bold">Admin Login</h2>
            <p className="text-gray-600 mt-2">Galeria Wedding Management</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Masukkan username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Masukkan password"
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
            </button>
          </form>
          
          <div className="text-center text-sm text-gray-500">
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
}