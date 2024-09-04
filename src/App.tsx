import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilterBar } from "@/components/FilterBar";
import { Login } from "@/components/Login";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto mt-8 px-4">
                    <FilterBar />
                  </div>
                </ProtectedRoute>
              }
            />
            {/* <Route path="/" element={<Navigate to="/filter" replace />} /> */}
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}
