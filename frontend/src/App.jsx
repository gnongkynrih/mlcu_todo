import "./App.css";
import {
  ThemeProvider,
  CssBaseline,
  Stack,
  Typography,
  Button,
  Box,
} from "@mui/material";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link as RouterLink,
} from "react-router-dom";
import Todo from "./pages/Todo";
import Test from "./pages/Test";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Payment from "./pages/Payment";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { useAuth } from "./context/AuthContext";
import { appTheme } from "./theme";

function Home() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <Box sx={{ py: 6 }}>
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/todo" replace />;
  }

  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ py: { xs: 8, md: 12 }, px: 2, textAlign: "center" }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: 800, letterSpacing: "-0.04em", maxWidth: 640 }}
      >
        Plan work clearly. Ship faster.
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
        Sign in to manage your tasks. Administrators can invite teammates and
        control roles from one place.
      </Typography>
      <Button
        component={RouterLink}
        variant="contained"
        size="large"
        to="/login"
        sx={{ px: 4, py: 1.25 }}
      >
        Sign in
      </Button>
    </Stack>
  );
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/todo" element={<Todo />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/payment" element={<Payment />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
