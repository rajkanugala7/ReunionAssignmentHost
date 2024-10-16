import React, { useMemo, useState } from "react";
import { MaterialReactTable } from "material-react-table";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { data } from "./data.js";
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';
import Fuse from 'fuse.js';

// Derive categories and subcategories
const categories = [...new Set(data.map(item => item.category))]; 
const subcategories = [...new Set(data.map(item => item.subcategory))];

export default function App() {
  // State and other hooks
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    category: [],
    subcategory: [],
    priceRange: [0, 100],
    createdAt: [new Date(0), new Date()],
  });

  // Columns definition
  const columns = useMemo(() => [
    { accessorKey: "id", header: "ID", enableSorting: true },
    { accessorKey: "name", header: "Name", enableSorting: true },
    { accessorKey: "category", header: "Category", enableSorting: true },
    { accessorKey: "subcategory", header: "Subcategory", enableSorting: true },
    {
      accessorKey: "createdAt",
      header: "Created At",
      Cell: ({ renderedCellValue }) =>
        new Date(renderedCellValue).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      enableSorting: true,
    },
    {
      accessorKey: "price",
      header: "Price",
      Cell: ({ renderedCellValue }) =>
        renderedCellValue != null ? `$${renderedCellValue.toFixed(2)}` : "N/A",
      enableSorting: true,
    },
    {
      accessorKey: "sale_price",
      header: "Sale Price",
      Cell: ({ renderedCellValue }) =>
        renderedCellValue != null ? `$${renderedCellValue.toFixed(2)}` : "N/A",
      enableSorting: true,
    },
  ], []);

  // Function to handle page changes
  const handlePageChange = (event, newPage) => {
    setPageIndex(newPage - 1);
  };

  // Function to apply filters
  const applyFilters = (row) => {
    const { name, category, subcategory, priceRange, createdAt } = filters;

    const fuse = new Fuse(data, {
      keys: ['name'],
      includeScore: true,
    });

    const fuzzyResult = fuse.search(name);
    const matchesName = fuzzyResult.length ? fuzzyResult.some(result => result.item.id === row.id) : true;
    const matchesCategory = category.length ? category.includes(row.category) : true;
    const matchesSubcategory = subcategory.length ? subcategory.includes(row.subcategory) : true;
    const matchesPrice = row.price >= priceRange[0] && row.price <= priceRange[1];
    const matchesDate = new Date(row.createdAt) >= createdAt[0] && new Date(row.createdAt) <= createdAt[1];

    return matchesName && matchesCategory && matchesSubcategory && matchesPrice && matchesDate;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
        <div>
          <IconButton onClick={() => setFilterDialogOpen(true)}>
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={() => setColumnVisibility(prev => ({ ...prev, category: !prev.category }))}>
            <GroupIcon />
          </IconButton>
        </div>
      </div>

      <div style={{ flex: "1", overflow: "hidden" }}>
        <MaterialReactTable
          columns={columns}
          data={data.filter(applyFilters).slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)}
          enableColumnFilters={true}
          enableSorting={true}
          enablePagination={false}
          initialState={{
            pagination: { pageSize: pageSize, pageIndex: pageIndex },
            columnVisibility
          }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [10, 25, 50],
          }}
          muiTableBodyProps={{
            sx: {
              maxHeight: "calc(100vh - 180px)", // Adjust based on header and footer height
              overflowY: "auto",
            },
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Pagination
            count={Math.ceil(data.filter(applyFilters).length / pageSize)}
            page={pageIndex + 1}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
          />
        </Stack>
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Filter Products</DialogTitle>
        <DialogContent>
          <TextField
            label="Search by Name"
            variant="outlined"
            fullWidth
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <FormControl fullWidth variant="outlined" sx={{ marginTop: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              multiple
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" sx={{ marginTop: 2 }}>
            <InputLabel id="subcategory-label">Subcategory</InputLabel>
            <Select
              labelId="subcategory-label"
              multiple
              value={filters.subcategory}
              onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
              label="Subcategory"
            >
              {subcategories.map((subcat) => (
                <MenuItem key={subcat} value={subcat}>
                  {subcat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ marginTop: 2 }}>
            <InputLabel> Price Range</InputLabel>
            <br/> <br/>
            <Slider
              value={filters.priceRange}
              onChange={(e, newValue) => setFilters({ ...filters, priceRange: newValue })}
              valueLabelDisplay="auto"
              min={0}
              max={200} // Adjust this based on your data
            />
            <br/>
          </FormControl>

          <div style={{ marginTop: 2 }}>
            <InputLabel>Created At Range</InputLabel>
            
            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                value={filters.createdAt[0].toISOString().split('T')[0]}
                onChange={(e) => setFilters({ ...filters, createdAt: [new Date(e.target.value), filters.createdAt[1]] })}
                fullWidth
              />
              <TextField
                type="date"
                value={filters.createdAt[1].toISOString().split('T')[0]}
                onChange={(e) => setFilters({ ...filters, createdAt: [filters.createdAt[0], new Date(e.target.value)] })}
                fullWidth
              />
            </Stack>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
