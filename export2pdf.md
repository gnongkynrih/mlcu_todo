# Export Todos to PDF

This document explains the implementation of the PDF export feature for the Todo application.

## Overview

The PDF export feature allows users to:
1. Generate a PDF report of todos filtered by date range
2. Download the PDF file with a filename based on the selected date range
3. View the data in a formatted table with styled headers

## Frontend Implementation

### Dependencies

- **jspdf**: JavaScript library for generating PDF documents
  ```bash
  npm install jspdf
  ```
- **jspdf-autotable**: Plugin for jsPDF to generate tables
  ```bash
  npm install jspdf-autotable
  ```

These libraries are already installed in the frontend project.

### Location

The PDF export functionality is implemented in:
- **File**: `frontend/src/pages/Reports.jsx`
- **Function**: `handleExportToPDF()`

### How It Works

The PDF export is entirely client-side, meaning:
- No backend API endpoint is required
- The PDF is generated in the browser using JavaScript
- Data is already available in the `filteredTodos` state after the user clicks "List"

### Implementation Details

#### Function Signature

```javascript
const handleExportToPDF = () => {
  // Implementation
};
```

#### Validation

The function performs two validations:

1. **Date Selection Check**: Ensures both start and end dates are selected
   ```javascript
   if (!startDate || !endDate) {
     alert("Please select both start and end dates");
     return;
   }
   ```

2. **Data Existence Check**: Ensures there are todos to export
   ```javascript
   if (filteredTodos.length === 0) {
     alert("No todos to export");
     return;
   }
   ```

#### PDF Generation Process

1. **Create PDF Document**:
   ```javascript
   const doc = new jsPDF();
   ```

2. **Format Dates**:
   ```javascript
   const startDateStr = startDate.toISOString().split("T")[0];
   const endDateStr = endDate.toISOString().split("T")[0];
   ```

3. **Add Header Information**:
   - Title: "Todo Report" (18pt font)
   - Date Range: "Date Range: YYYY-MM-DD to YYYY-MM-DD" (11pt font)
   - Total Count: "Total Todos: N" (11pt font)

   ```javascript
   doc.setFontSize(18);
   doc.text("Todo Report", 14, 20);
   doc.setFontSize(11);
   doc.text(`Date Range: ${startDateStr} to ${endDateStr}`, 14, 28);
   doc.text(`Total Todos: ${filteredTodos.length}`, 14, 34);
   ```

4. **Prepare Table Data**:
   Map the `filteredTodos` array to a 2D array with columns:
   - Title
   - Description
   - Status (Completed/Pending)
   - Created At (formatted date)

   ```javascript
   const tableData = filteredTodos.map((todo) => [
     todo.title,
     todo.description || "",
     todo.is_completed ? "Completed" : "Pending",
     new Date(todo.createdAt).toLocaleDateString(),
   ]);
   ```

5. **Generate Table Using autoTable**:
   ```javascript
   autoTable(doc, {
     head: [["Title", "Description", "Status", "Created At"]],
     body: tableData,
     startY: 40,
     styles: {
       fontSize: 10,
       cellPadding: 3,
     },
     headStyles: {
       fillColor: [124, 58, 237],  // Purple color
       textColor: [255, 255, 255],  // White text
       fontStyle: "bold",
     },
     alternateRowStyles: {
       fillColor: [245, 245, 245],  // Light gray for alternate rows
     },
   });
   ```

6. **Save PDF**:
   ```javascript
   doc.save(`todos_${startDateStr}_to_${endDateStr}.pdf`);
   ```

### UI Integration

The PDF export button is placed next to the Excel export button in the Reports page:

```jsx
{showDateRangeResults && filteredTodos.length > 0 && (
  <>
    <Button
      variant="contained"
      startIcon={<FileDownloadIcon />}
      onClick={handleExportToExcel}
    >
      Export to Excel
    </Button>
    <Button
      variant="contained"
      startIcon={<PictureAsPdfIcon />}
      onClick={handleExportToPDF}
    >
      Export to PDF
    </Button>
  </>
)}
```

**Conditional Display**:
- Both export buttons only appear when:
  - `showDateRangeResults` is `true` (user has clicked "List")
  - `filteredTodos.length > 0` (there are results to export)

### Styling

The PDF uses the following styling:

- **Header**: Purple background (#7C3AED) with white bold text
- **Alternate Rows**: Light gray background (#F5F5F5) for readability
- **Font Size**: 10pt for table content
- **Cell Padding**: 3px for compact but readable spacing
- **Table Start**: Y position 40 (below the header text)

### File Naming

The PDF filename follows the pattern:
```
todos_{startDate}_to_{endDate}.pdf
```

Example: `todos_2024-01-01_to_2024-12-31.pdf`

### Error Handling

The function includes a try-catch block to handle potential errors:

```javascript
try {
  // PDF generation code
} catch (error) {
  console.error("PDF export failed:", error);
  alert("Failed to export to PDF");
}
```

Common error scenarios:
- Invalid date format
- Empty data
- jsPDF library errors
- Browser compatibility issues

## Comparison with Excel Export

| Aspect | PDF Export | Excel Export |
|--------|------------|--------------|
| **Implementation** | Client-side (jsPDF) | Server-side (exceljs) |
| **API Endpoint** | Not required | `/todos/export-excel` |
| **Data Source** | `filteredTodos` state | Backend query |
| **File Format** | PDF (.pdf) | Excel (.xlsx) |
| **Styling** | Custom styling in code | ExcelJS styling |
| **Use Case** | Readable reports | Data manipulation |

## Advantages of Client-Side PDF Export

1. **No Backend Load**: PDF generation doesn't affect server performance
2. **Instant Feedback**: Users see results immediately after clicking "List"
3. **Data Consistency**: Uses the same data displayed on screen
4. **Offline Capability**: Works with already-fetched data
5. **Customizable**: Easy to modify styling and layout

## Limitations

1. **Browser Dependency**: Relies on JavaScript execution in browser
2. **Large Datasets**: May be slow with very large datasets (1000+ todos)
3. **Complex Formatting**: Limited compared to server-side PDF generation tools
4. **No Server Validation**: Data validation happens before export

## Testing

To test the PDF export:

1. Create several todos with different dates
2. Navigate to the Reports page
3. Select a start date and end date
4. Click "List" to see filtered results
5. Click "Export to PDF"
6. Verify the PDF downloads with correct filename
7. Open the PDF and check:
   - Title and date range are correct
   - Total count matches the number of todos
   - Table contains all todos with correct data
   - Styling (purple header, alternate rows) is applied
   - All columns are readable

## Troubleshooting

### PDF doesn't download

- Check browser console for errors
- Verify jspdf and jspdf-autotable are installed
- Ensure `filteredTodos` has data

### PDF is empty

- Verify date range includes todos
- Check console for data mapping errors
- Ensure `showDateRangeResults` is true

### Styling issues

- Verify autoTable configuration
- Check fill color values (RGB format)
- Ensure startY position doesn't overlap with header

### Large file size

- Consider adding pagination for large datasets
- Optimize images if added to PDF
- Use compression options if available

## Future Enhancements

Potential improvements to the PDF export:

1. **Pagination**: Add page breaks for large datasets
2. **Filters**: Add options to filter by status before export
3. **Charts**: Include visual charts in the PDF
4. **Custom Styling**: Allow users to customize colors and fonts
5. **Multiple Formats**: Export to multiple formats simultaneously
6. **Email Integration**: Send PDF via email directly
7. **Password Protection**: Add password protection to PDF files

## References

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jspdf-autotable Documentation](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [MDN: Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
