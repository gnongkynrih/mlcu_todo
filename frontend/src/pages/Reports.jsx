import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState } from "react";
import { api } from "../api/client";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssessmentIcon from "@mui/icons-material/Assessment";

export default function Reports() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [showDateRangeResults, setShowDateRangeResults] = useState(false);

  const handleListByDateRange = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    try {
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];
      const res = await api.get("/todos/date-range", {
        params: { startDate: startDateStr, endDate: endDateStr },
      });
      setFilteredTodos(res.data);
      setShowDateRangeResults(true);
    } catch (error) {
      console.error("Date range search failed:", error);
      alert("Failed to fetch todos for date range");
    }
  };

  const handleExportToExcel = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    try {
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];
      const response = await api.get("/todos/export-excel", {
        params: { startDate: startDateStr, endDate: endDateStr },
        responseType: "blob",
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `todos_${startDateStr}_to_${endDateStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Failed to export to Excel");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 750, letterSpacing: "-0.03em" }}
          >
            Reports
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Generate and export todo reports by date range.
          </Typography>
        </Box>

        {/* Date Range Filter Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Filter by Date Range
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleListByDateRange}
                disabled={!startDate || !endDate}
              >
                List
              </Button>
              {showDateRangeResults && filteredTodos.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportToExcel}
                >
                  Export to Excel
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Results Section */}
        {showDateRangeResults && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Date Range Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredTodos.length} todos found
              </Typography>
            </Stack>

            {filteredTodos.length > 0 ? (
              <Stack spacing={1}>
                {filteredTodos.map((todo) => (
                  <Box
                    key={todo.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography fontWeight={700}>{todo.title}</Typography>
                    {todo.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {todo.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Status: {todo.is_completed ? "Completed" : "Pending"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(todo.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No tasks found in this date range.
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Stack>
    </LocalizationProvider>
  );
}
