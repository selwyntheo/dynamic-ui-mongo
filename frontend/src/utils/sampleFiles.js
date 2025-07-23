import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const createSampleExcelFile = () => {
  const sampleData = [
    // Row 1: Headers
    ['id', 'name', 'email', 'age', 'isActive', 'createdDate', 'tags', 'profile'],
    // Row 2: Data Types
    ['Number', 'String', 'String', 'Number', 'Boolean', 'Date', 'Array', 'Object'],
    // Row 3+: Sample Data
    [1, 'John Doe', 'john@example.com', 30, true, '2024-01-15', 'admin,user', '{"department": "IT", "level": "senior"}'],
    [2, 'Jane Smith', 'jane@example.com', 28, false, '2024-01-16', 'user', '{"department": "HR", "level": "manager"}'],
    [3, 'Bob Johnson', 'bob@example.com', 35, true, '2024-01-17', 'user,manager', '{"department": "Sales", "level": "lead"}'],
    [4, 'Alice Wilson', 'alice@example.com', 32, true, '2024-01-18', 'admin', '{"department": "IT", "level": "manager"}'],
    [5, 'Charlie Brown', 'charlie@example.com', 29, false, '2024-01-19', 'user', '{"department": "Marketing", "level": "junior"}']
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sample Collection');
  
  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 8 },   // id
    { wch: 15 },  // name
    { wch: 25 },  // email
    { wch: 8 },   // age
    { wch: 12 },  // isActive
    { wch: 15 },  // createdDate
    { wch: 20 },  // tags
    { wch: 35 }   // profile
  ];

  // Add some styling to headers
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center" }
  };

  const typeStyle = {
    font: { italic: true, color: { rgb: "666666" } },
    fill: { fgColor: { rgb: "F2F2F2" } },
    alignment: { horizontal: "center" }
  };

  // Apply styling to header row
  for (let col = 0; col < sampleData[0].length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = headerStyle;
  }

  // Apply styling to type row
  for (let col = 0; col < sampleData[1].length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: col });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = typeStyle;
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, 'sample_collection_template.xlsx');
};

export const createCSVTemplate = () => {
  const csvData = [
    ['id', 'name', 'email', 'age', 'isActive', 'createdDate', 'tags', 'profile'],
    ['Number', 'String', 'String', 'Number', 'Boolean', 'Date', 'Array', 'Object'],
    ['1', 'John Doe', 'john@example.com', '30', 'true', '2024-01-15', 'admin,user', '{"department": "IT"}'],
    ['2', 'Jane Smith', 'jane@example.com', '28', 'false', '2024-01-16', 'user', '{"department": "HR"}'],
    ['3', 'Bob Johnson', 'bob@example.com', '35', 'true', '2024-01-17', 'user,manager', '{"department": "Sales"}']
  ];

  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'sample_collection_template.csv');
};
