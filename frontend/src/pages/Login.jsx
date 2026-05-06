import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { loginSchema, bootstrapSchema } from "../schemas/userSchema";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login() {
  const { login, bootstrapAdmin, user, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/todo";

  const [needsBootstrap, setNeedsBootstrap] = useState(null);
  const [setupError, setSetupError] = useState(null);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const bootstrapForm = useForm({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (!ready) return;
    if (user) {
      navigate(from, { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${baseURL}/users/setup-status`);
        if (!cancelled) setNeedsBootstrap(data.needsBootstrap);
      } catch {
        if (!cancelled) setSetupError("Could not reach the server. Is the API running?");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, navigate, from]);

  const onLogin = async (values) => {
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.error || "Sign in failed. Check your credentials.";
      loginForm.setError("root", { message });
    }
  };

  const onBootstrap = async (values) => {
    try {
      await bootstrapAdmin(values);
      navigate("/todo", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Could not create administrator account.";
      bootstrapForm.setError("root", { message });
    }
  };

  if (!ready || needsBootstrap === null) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(124,58,237,0.25), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(170,59,255,0.2), transparent 50%), linear-gradient(180deg, #0f172a 0%, #111827 40%, #0b1220 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.08)",
          bgcolor: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          color: "#e5e7eb",
        }}
      >
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}
          >
            Welcome
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
            {needsBootstrap ? "Create your workspace" : "Sign in"}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
            {needsBootstrap
              ? "Set up the first administrator. You can add team accounts later."
              : "Use your email and password to continue."}
          </Typography>
        </Stack>

        {setupError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {setupError}
          </Alert>
        ) : null}

        {needsBootstrap ? (
          <form onSubmit={bootstrapForm.handleSubmit(onBootstrap)}>
            <Stack spacing={2}>
              {bootstrapForm.formState.errors.root ? (
                <Alert severity="error">
                  {bootstrapForm.formState.errors.root.message}
                </Alert>
              ) : null}
              <Controller
                name="name"
                control={bootstrapForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Your name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={darkFieldSx}
                  />
                )}
              />
              <Controller
                name="email"
                control={bootstrapForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    autoComplete="email"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={darkFieldSx}
                  />
                )}
              />
              <Controller
                name="password"
                control={bootstrapForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={darkFieldSx}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  py: 1.25,
                  background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                  boxShadow: "0 10px 30px rgba(124,58,237,0.35)",
                }}
              >
                Create admin & continue
              </Button>
            </Stack>
          </form>
        ) : (
          <form onSubmit={loginForm.handleSubmit(onLogin)}>
            <Stack spacing={2}>
              {loginForm.formState.errors.root ? (
                <Alert severity="error">
                  {loginForm.formState.errors.root.message}
                </Alert>
              ) : null}
              <Controller
                name="email"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    autoComplete="username"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={darkFieldSx}
                  />
                )}
              />
              <Controller
                name="password"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={darkFieldSx}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  py: 1.25,
                  background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                  boxShadow: "0 10px 30px rgba(124,58,237,0.35)",
                }}
              >
                Sign in
              </Button>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                Admins can manage users from the Users area after signing in.
              </Typography>
            </Stack>
          </form>
        )}
        {!needsBootstrap ? (
          <Typography
            variant="body2"
            sx={{ mt: 2, textAlign: "center", color: "rgba(255,255,255,0.55)" }}
          >
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ textTransform: "none", p: 0, minWidth: 0 }}
            >
              Back to home
            </Button>
          </Typography>
        ) : null}
      </Paper>
    </Box>
  );
}

const darkFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#f9fafb",
    bgcolor: "rgba(0,0,0,0.2)",
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.65)" },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.15)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.25)",
  },
  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.45)" },
};
