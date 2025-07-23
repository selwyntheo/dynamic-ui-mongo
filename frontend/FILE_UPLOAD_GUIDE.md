# File Upload Feature - Collection Import

This feature allows you to create MongoDB collections by importing data from Excel (.xlsx, .xls) or CSV files.

## File Format Requirements

Your file should follow this specific format:

### Row Structure
1. **Row 1: Column Headers** - The field names for your collection
2. **Row 2: Data Types** - The MongoDB field types for each column
3. **Row 3+: Sample Data** - Optional sample data for preview (first 5 rows will be shown)

### Supported Data Types
- `String` - Text data
- `Number` - Numeric data (integers and decimals)
- `Boolean` - True/false values
- `Date` - Date/time values
- `Array` - Arrays (comma-separated values like "tag1,tag2,tag3")
- `Object` - JSON objects (like `{"department": "IT", "level": "senior"}`)

## Example File Structure

```
| id     | name      | email              | age    | isActive | createdDate | tags       | profile                    |
|--------|-----------|-------------------|--------|----------|-------------|------------|----------------------------|
| Number | String    | String            | Number | Boolean  | Date        | Array      | Object                     |
| 1      | John Doe  | john@example.com  | 30     | true     | 2024-01-15  | admin,user | {"department": "IT"}       |
| 2      | Jane Smith| jane@example.com  | 28     | false    | 2024-01-16  | user       | {"department": "HR"}       |
```

## Import Process

1. **Upload File**: Drag and drop or click to select your Excel/CSV file
2. **Configure Fields**: 
   - Review and edit field names
   - Adjust data types if needed
   - Set required fields
   - Remove unwanted columns
3. **Preview & Create**: Review the collection schema and create

## Features

- ✅ **Download Sample Template**: Get a pre-formatted Excel file to understand the expected structure
- ✅ **Field Mapping**: Automatically map columns to MongoDB field types
- ✅ **Data Type Detection**: Smart detection of data types from your sample data
- ✅ **Field Customization**: Edit field names, types, and requirements
- ✅ **Preview**: See how your data will be structured before creating the collection
- ✅ **Validation**: Comprehensive validation of field names and data types

## Tips

1. **Field Names**: Will be automatically converted to MongoDB-friendly format (lowercase, underscores)
2. **Data Types**: Choose the most appropriate type for your data
3. **Arrays**: Use comma-separated values (e.g., "tag1,tag2,tag3")
4. **Objects**: Use valid JSON format (e.g., `{"key": "value"}`)
5. **Dates**: Use standard date formats (YYYY-MM-DD, etc.)

## Sample Template

Click the "Download Sample Template" button in the import dialog to get a ready-to-use Excel file that demonstrates the correct format.
