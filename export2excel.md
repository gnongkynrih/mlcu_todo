# Export Todos to Excel

This document explains the implementation of the date range filtering and Excel export feature for the Todo application.

## Overview

The feature allows users to:

1. Select a date range (start date and end date)
2. List all todos created within that date range
3. Export the filtered todos to an Excel file if data is found

## Backend Implementation

### Dependencies

- **exceljs**: Used to generate Excel files
  ```bash
  npm install exceljs
  ```

### Service Layer (`backend/src/services/todo.service.js`)

#### `getTodosByDateRange(startDate, endDate)`

Fetches all todos within a date range.

- **Parameters**:
  - `startDate`: ISO date string (e.g., "2024-01-01")
  - `endDate`: ISO date string (e.g., "2024-12-31")
- **Query Logic**: Uses Prisma's `gte` (greater than or equal) and `lte` (less than or equal) operators on the `createdAt` field
- **Returns**: Array of todos sorted by `createdAt` in descending order

```javascript
const todos = await prisma.todo.findMany({
  where: {
    createdAt: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
  },
  orderBy: { createdAt: "desc" },
});
```

#### `exportTodosToExcel(startDate, endDate)`

Generates an Excel workbook containing todos within the date range.

- **Parameters**: Same as `getTodosByDateRange`
- **Excel Structure**:
  - Worksheet name: "Todos"
  - Columns: ID, Title, Description, Status, Created At
  - Header row styling: Bold text with light gray background
- **Returns**: ExcelJS workbook object

```javascript
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Todos");

worksheet.columns = [
  { header: "ID", key: "id", width: 10 },
  { header: "Title", key: "title", width: 30 },
  { header: "Description", key: "description", width: 40 },
  { header: "Status", key: "is_completed", width: 15 },
  { header: "Created At", key: "createdAt", width: 25 },
];
```

### Controller Layer (`backend/src/controllers/todo.controller.js`)

#### `getTodosByDateRange(req, res)`

HTTP endpoint to fetch todos by date range.

- **Route**: `GET /todos/date-range`
- **Query Parameters**:
  - `startDate`: Start date (required)
  - `endDate`: End date (required)
- **Response**: JSON array of todos
- **Error Handling**: Returns 400 if dates are missing, 500 on server error

#### `exportTodosToExcel(req, res)`

HTTP endpoint to download todos as an Excel file.

- **Route**: `GET /todos/export-excel`
- **Query Parameters**: Same as `getTodosByDateRange`
- **Response Headers**:
  - `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition`: `attachment; filename=todos_{startDate}_to_{endDate}.xlsx`
- **Response**: Binary Excel file stream

```javascript
res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
);
res.setHeader(
  "Content-Disposition",
  `attachment; filename=todos_${startDate}_to_${endDate}.xlsx`,
);
await workbook.xlsx.write(res);
```

### Routes (`backend/src/routes/todo.route.js`)

```javascript
router.get("/date-range", getTodosByDateRange);
router.get("/export-excel", exportTodosToExcel);
```

Both routes are protected by `authMiddleware`, ensuring only authenticated users can access them.

## Frontend Implementation

### Dependencies

- **@mui/x-date-pickers**: Material-UI date picker components
  ```bash
  npm install @mui/x-date-pickers
  ```
- **date-fns**: Required by AdapterDateFns for date manipulation
  ```bash
  npm install date-fns
  ```

### Reports Page (`frontend/src/pages/Reports.jsx`)

A dedicated page for generating and exporting todo reports by date range.

#### State Management

```javascript
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
const [filteredTodos, setFilteredTodos] = useState([]);
const [showDateRangeResults, setShowDateRangeResults] = useState(false);
```

### UI Components

#### Date Range Picker Section

A Paper component containing:

- Two DatePicker components (start and end dates)
- "List" button to fetch todos
- "Export to Excel" button (conditionally shown when data exists)
- Results display area showing filtered todos with status and creation dates

```jsx
<LocalizationProvider dateAdapter={AdapterDateFns}>
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
  <Button onClick={handleListByDateRange} disabled={!startDate || !endDate}>
    List
  </Button>
  {showDateRangeResults && filteredTodos.length > 0 && (
    <Button startIcon={<FileDownloadIcon />} onClick={handleExportToExcel}>
      Export to Excel
    </Button>
  )}
</LocalizationProvider>
```

**Import paths for MUI v9:**

```javascript
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
```

### Routing

The Reports page is accessible at `/reports` and is protected by `ProtectedRoute` (requires authentication).

In `App.jsx`:

```javascript
<Route path="/reports" element={<Reports />} />
```

Navigation link in `AppLayout.jsx`:

```javascript
<Button
  component={RouterLink}
  to="/reports"
  startIcon={<AssessmentIcon />}
  color="inherit"
  sx={{ textTransform: "none" }}
>
  Reports
</Button>
```

### Handler Functions

#### `handleListByDateRange()`

Fetches todos for the selected date range.

1. Validates that both dates are selected
2. Formats dates to ISO string (YYYY-MM-DD)
3. Calls the `/todos/date-range` endpoint
4. Updates `filteredTodos` state
5. Sets `showDateRangeResults` to true

```javascript
const handleListByDateRange = async () => {
  if (!startDate || !endDate) {
    alert("Please select both start and end dates");
    return;
  }
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];
  const res = await api.get("/todos/date-range", {
    params: { startDate: startDateStr, endDate: endDateStr },
  });
  setFilteredTodos(res.data);
  setShowDateRangeResults(true);
};
```

#### `handleExportToExcel()`

Downloads the Excel file using the api client.

1. Validates that both dates are selected
2. Formats dates to ISO string (YYYY-MM-DD)
3. Calls the `/export-excel` endpoint with `responseType: 'blob'`
4. Creates a blob URL and triggers download via an anchor element
5. Cleans up the blob URL after download

```javascript
const handleExportToExcel = async () => {
  if (!startDate || !endDate) {
    alert("Please select both start and end dates");
    return;
  }
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];
  const response = await api.get("/todos/export-excel", {
    params: { startDate: startDateStr, endDate: endDateStr },
    responseType: "blob",
  });

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
};
```

### Results Display

The Reports page displays filtered results in a dedicated section:

- Shows only when `showDateRangeResults` is true
- Displays todo title, description, status, and creation date
- Shows empty state message when no todos found in the date range
- Results are shown in a styled Paper component with clear visual separation

## Authentication

Both backend endpoints are protected by `authMiddleware`, which:

1. Validates the JWT token from the `Authorization` header
2. Extracts `userId` from the token
3. Attaches `userId` to `req.userId` for use in controllers

The frontend `api` client automatically includes the JWT token in the Authorization header for all requests.

## Date Format

- **Input**: JavaScript Date objects (from DatePicker)
- **Backend Query**: ISO date strings (YYYY-MM-DD)
- **Database**: DateTime objects
- **Excel Export**: ISO string format for display

## Error Handling

### Backend

- Missing dates: Returns 400 with error message
- Database errors: Returns 500 with error message
- Excel generation errors: Returns 500 with error message

### Frontend

- Missing dates: Shows alert dialog
- API errors: Logs to console and shows alert
- Empty results: Shows friendly message in UI

## Security Considerations

1. **Authentication**: JWT validation required for all operations via `authMiddleware`
2. **Input Validation**: Backend validates that startDate and endDate are provided
3. **Date Range**: Prisma's date operators ensure proper range filtering
4. **Note**: The date range query does not filter by `userId` - it returns all todos within the date range. If user isolation is required, add `userId` filtering to the query.

## Testing

To test the feature:

1. Create several todos with different dates
2. Navigate to the Reports page via the navigation bar
3. Select a start date and end date
4. Click "List" to see filtered results
5. If results exist, click "Export to Excel" to download the file
6. Verify the Excel file contains the correct data

## Architecture Notes

- The Reports page is a separate component for better separation of concerns
- Todo page remains focused on task management (CRUD operations)
- Reports page handles all date range filtering and export functionality
- Both pages share the same backend endpoints (`/todos/date-range` and `/todos/export-excel`)
