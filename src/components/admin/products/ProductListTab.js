"use client";

import { useMemo, useRef, useState } from "react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-custom.css";

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";

import { COLLECTION_OPTIONS, formatCurrency } from "./productFormUtils";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ProductListTab({
  products,
  categories,
  categoryFilter,
  collectionFilter,
  onCategoryFilterChange,
  onCollectionFilterChange,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  const theme = useTheme();

  const gridRef = useRef(null);

  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = async () => {
    if (!deleteId) return;

    await onDeleteProduct(deleteId);

    setDeleteId(null);
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Image",
        field: "images",
        width: 90,
        sortable: false,
        filter: false,

        cellRenderer: ({ data }) =>
          data?.images?.[0] ? (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <img
                src={data.images[0]}
                alt={data?.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ) : (
            "-"
          ),
      },

      {
        field: "name",
        headerName: "Product",
        flex: 1.5,
        minWidth: 200,

        cellRenderer: ({ value }) => (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.92rem",
              color: "#0f172a",
            }}
          >
            {value}
          </Typography>
        ),
      },

      {
        field: "category",
        headerName: "Category",
        width: 130,

        cellRenderer: ({ value }) => (
          <Chip
            label={value || "-"}
            size="small"
            sx={{
              height: 26,
              fontSize: "0.74rem",
              borderRadius: "8px",
              background: "#f1f5f9",
              color: "#475569",
              fontWeight: 500,
            }}
          />
        ),
      },

      {
        field: "collection",
        headerName: "Collection",
        width: 130,

        cellRenderer: ({ value }) => (
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            {value || "-"}
          </Typography>
        ),
      },

      {
        field: "price",
        headerName: "Price",
        width: 120,

        cellRenderer: ({ value }) => (
          <Typography
            sx={{
              fontWeight: 700,
              color: "#16a34a",
              fontSize: "0.9rem",
            }}
          >
            {formatCurrency(value || 0)}
          </Typography>
        ),
      },

      {
        field: "mrp",
        headerName: "MRP",
        width: 120,

        cellRenderer: ({ value }) => (
          <Typography
            sx={{
              fontSize: "0.84rem",
              color: "#94a3b8",
              textDecoration: "line-through",
            }}
          >
            {formatCurrency(value || 0)}
          </Typography>
        ),
      },

      {
        field: "stock",
        headerName: "Stock",
        width: 110,

        cellRenderer: ({ value }) =>
          value <= 5 ? (
            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
              label={value}
              size="small"
              sx={{
                height: 26,
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#dc2626",
                fontWeight: 600,
              }}
            />
          ) : (
            <Typography
              sx={{
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {value}
            </Typography>
          ),
      },

      {
        field: "viewCount",
        headerName: "Views",
        width: 100,

        cellRenderer: ({ value }) => (
          <Typography
            sx={{
              fontWeight: 500,
              color: "#64748b",
            }}
          >
            {value || 0}
          </Typography>
        ),
      },

      {
        headerName: "Actions",
        width: 120,
        sortable: false,
        filter: false,

        cellRenderer: (params) => {
          const id = params.data?._id || params.data?.id;

          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="View">
                <IconButton
                  size="small"
                  component="a"
                  href={`/shop/${params.data?.slug || id}`}
                  target="_blank"
                  sx={{
                    color: "#64748b",
                    "&:hover": {
                      background: "#f1f5f9",
                    },
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => setDeleteId(id)}
                  sx={{
                    color: "#ef4444",
                    "&:hover": {
                      background: "#fef2f2",
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [theme]
  );

  return (
    <>
      {/* TOP BAR */}

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Products
          </Typography>

          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "#64748b",
              mt: 0.5,
            }}
          >
            {products.length} products available
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddProduct}
            sx={{
              height: 42,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Add Product
          </Button>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>

            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              sx={{
                borderRadius: "12px",
              }}
            >
              <MenuItem value="">All</MenuItem>

              {categories.map((c) => (
                <MenuItem key={c._id || c.id} value={c.slug}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Collection</InputLabel>

            <Select
              label="Collection"
              value={collectionFilter}
              onChange={(e) => onCollectionFilterChange(e.target.value)}
              sx={{
                borderRadius: "12px",
              }}
            >
              <MenuItem value="">All</MenuItem>

              {COLLECTION_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* SEARCH */}

      <TextField
        size="small"
        placeholder="Search products..."
        onChange={(e) => gridRef.current?.api?.setQuickFilter(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon
                sx={{
                  fontSize: 18,
                  color: "#94a3b8",
                }}
              />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          width: { xs: "100%", md: 320 },

          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            background: "#fff",
          },
        }}
      />

      {/* GRID */}

      <Box
        className="ag-theme-quartz"
        sx={{
          width: "100%",
          height: 620,
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={products}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={10}
          animateRows
          suppressCellFocus
          rowHeight={64}
          headerHeight={52}
          defaultColDef={{
            sortable: true,
            filter: true,
            flex: 1,
            minWidth: 120,
            resizable: false,
          }}
          getRowId={(params) => String(params.data?._id || params.data?.id)}
        />
      </Box>

      {/* DELETE DIALOG */}

      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          Delete Product
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.92rem",
            }}
          >
            Are you sure you want to delete this product?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteId(null)}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
