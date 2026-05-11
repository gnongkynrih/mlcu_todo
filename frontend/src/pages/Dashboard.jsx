import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import { api } from "../api/client";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const pieOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "left",
    },
    tooltip: {
      callbacks: {
        label(context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const v = context.raw ?? 0;
          const pct = total ? Math.round((v / total) * 100) : 0;
          return `${context.label}: ${v} (${pct}%)`;
        },
      },
    },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 0,
      },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
    },
  },
};

function StatCard({ title, value, icon: Icon }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(255,255,255,0) 60%)",
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 1.5,
          bgcolor: "secondary.main",
          color: "white",
          display: "flex",
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, letterSpacing: "-0.02em" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: json } = await api.get("/dashboard/summary");
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.error ||
              e.message ||
              "Could not load dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pieChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: ["Completed", "Not completed"],
      datasets: [
        {
          data: [data.todosCompleted, data.todosIncomplete],
          backgroundColor: ["#16a34a", "#cbd5e1"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const barChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.tasksPerUser.map((u) => u.name),
      datasets: [
        {
          label: "Tasks",
          data: data.tasksPerUser.map((u) => u.taskCount),
          backgroundColor: "rgba(124, 58, 237, 0.75)",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data || !pieChartData || !barChartData) {
    return null;
  }

  const totalTodos = data.todosCompleted + data.todosIncomplete;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 750, letterSpacing: "-0.03em" }}>
          Dashboard
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Workspace overview: users and tasks across the system (admin only).
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Registered users" value={data.userCount} icon={PeopleAltOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total todos"
            value={totalTodos}
            icon={ListAltOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Completion rate"
            value={
              totalTodos
                ? `${Math.round((data.todosCompleted / totalTodos) * 100)}%`
                : "—"
            }
            icon={DonutLargeOutlinedIcon}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Todos by status
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share of completed vs open tasks (all users).
            </Typography>
            <Box sx={{ maxWidth: 360, mx: "auto", position: "relative", minHeight: 260 }}>
              <Pie data={pieChartData} options={pieOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Tasks per user
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Number of todos owned by each account (including zero).
            </Typography>
            <Box sx={{ position: "relative", minHeight: 280 }}>
              <Bar data={barChartData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
