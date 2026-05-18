import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import GroupIcon from "@mui/icons-material/Group";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";

const linkSx = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 500,
  opacity: 0.9,
  "&:hover": { opacity: 1 },
};

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ gap: 2, py: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/todo"
            sx={{
              ...linkSx,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              mr: "auto",
            }}
          >
            Taskboard
          </Typography>
          <Button
            component={RouterLink}
            to="/todo"
            startIcon={<ChecklistRtlIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Todos
          </Button>
          <Button
            component={RouterLink}
            to="/reports"
            startIcon={<AssessmentIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Reports
          </Button>
          <Button
            component={RouterLink}
            to="/payment"
            startIcon={<PaymentIcon />}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Payment
          </Button>
          {isAdmin ? (
            <>
              <Button
                component={RouterLink}
                to="/dashboard"
                startIcon={<SpaceDashboardOutlinedIcon />}
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                Dashboard
              </Button>
              <Button
                component={RouterLink}
                to="/users"
                startIcon={<GroupIcon />}
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                Users
              </Button>
            </>
          ) : null}
          <Typography
            variant="body2"
            sx={{ opacity: 0.8, display: { xs: "none", sm: "block" } }}
          >
            {user?.name || user?.email}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            sx={{ textTransform: "none" }}
          >
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, py: { xs: 2, md: 4 } }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
