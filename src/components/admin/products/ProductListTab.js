"use client";

import { useMemo, useRef, useState } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
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
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        width: 90,
        sortable: false,
        filter: false,
        cellRenderer: ({ data }) =>
          data?.images?.[0] ? (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                },
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
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: theme.palette.action.hover,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                color: theme.palette.text.disabled,
              }}
            >
              -
            </Box>
          ),
      },

      {
        field: "name",
        headerName: "Product",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: ({ value }) => (
          <Typography 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "0.938rem" },
              color: theme.palette.text.primary,
            }}
          >
            {value}
          </Typography>
        ),
      },

      {
        field: "category",
        headerName: "Category",
        width: 140,
        cellRenderer: ({ value }) => (
          <Chip
            label={value || "-"}
            size="small"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              backgroundColor: theme.palette.primary.light + "20",
              color: theme.palette.primary.main,
            }}
          />
        ),
      },

      {
        field: "collection",
        headerName: "Collection",
        width: 140,
        cellRenderer: ({ value }) => (
          <Chip
            label={value || "-"}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          />
        ),
      },

      {
        field: "price",
        headerName: "Price",
        width: 120,
        valueFormatter: (p) => formatCurrency(p.value || 0),
        cellRenderer: ({ value }) => (
          <Typography sx={{ fontWeight: 600, color: theme.palette.success.main }}>
            {formatCurrency(value || 0)}
          </Typography>
        ),
      },

      {
        field: "mrp",
        headerName: "MRP",
        width: 120,
        valueFormatter: (p) => formatCurrency(p.value || 0),
        cellRenderer: ({ value }) => (
          <Typography sx={{ 
            textDecoration: "line-through", 
            opacity: 0.6,
            fontSize: "0.875rem",
          }}>
            {formatCurrency(value || 0)}
          </Typography>
        ),
      },

      {
        field: "stock",
        headerName: "Stock",
        width: 120,
        cellRenderer: ({ value }) =>
          value <= 5 ? (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 16 }} />}
              label={value}
              color="error"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          ) : (
            <Chip 
              label={value} 
              color="success" 
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          ),
      },

      {
        headerName: "Sizes",
        width: 120,
        valueGetter: ({ data }) =>
          data?.sizes?.length ? data.sizes.join(", ") : "-",
        cellRenderer: ({ value }) => (
          <Typography sx={{ fontSize: "0.813rem", color: theme.palette.text.secondary }}>
            {value}
          </Typography>
        ),
      },

      {
        headerName: "Colors",
        width: 140,
        valueGetter: ({ data }) =>
          data?.colors?.length ? data.colors.join(", ") : "-",
        cellRenderer: ({ value }) => (
          <Typography sx={{ fontSize: "0.813rem", color: theme.palette.text.secondary }}>
            {value}
          </Typography>
        ),
      },

      {
        field: "rating",
        headerName: "Rating",
        width: 110,
        valueFormatter: (p) =>
          p.value ? `${p.value} (${p.data.reviewCount})` : "-",
        cellRenderer: ({ data }) => 
          data.rating ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                ⭐ {data.rating}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", opacity: 0.6 }}>
                ({data.reviewCount})
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ opacity: 0.5 }}>-</Typography>
          ),
      },

      {
        field: "viewCount",
        headerName: "Views",
        width: 110,
        cellRenderer: ({ value }) => (
          <Chip
            label={value || 0}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          />
        ),
      },

      {
        headerName: "Actions",
        width: 140,
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const id = params.data?._id || params.data?.id;

          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="View" arrow>
                <IconButton
                  size="small"
                  component="a"
                  href={`/shop/${params.data?.slug || id}`}
                  target="_blank"
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: theme.palette.info.light + "20",
                      color: theme.palette.info.main,
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* <Tooltip title="Edit" arrow>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEditProduct(params.data)}
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip> */}

              <Tooltip title="Delete" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteId(id)}
                  sx={{
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [onEditProduct, theme],
  );

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 2.5, sm: 3 },
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", sm: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "flex-start" }}
        spacing={{ xs: 2, sm: 2.5, md: 2 }}
        sx={{ mb: { xs: 2.5, sm: 3 } }}
      >
        <Box>
          <Typography 
            variant="h6"
            sx={{
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.5,
              "&::before": {
                content: '""',
                width: 4,
                height: 24,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                borderRadius: 2,
              },
            }}
          >
            Products
          </Typography>
          <Typography 
            sx={{ 
              opacity: 0.7,
              fontSize: { xs: "0.813rem", sm: "0.875rem" },
              pl: { xs: 0, sm: 2 },
            }}
          >
            Manage your product catalog ({products.length} items)
          </Typography>
        </Box>

        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={{ xs: 1.5, sm: 1 }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button 
            variant="contained" 
            onClick={onAddProduct}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: { xs: 2, sm: 2.5 },
              py: { xs: 1, sm: 1.2 },
              px: { xs: 2, sm: 2.5 },
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "0.938rem" },
              textTransform: "none",
              boxShadow: theme.palette.brand?.shadowButton || "0 4px 12px rgba(0,0,0,0.15)",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.palette.brand?.shadowCardStrong || "0 6px 16px rgba(0,0,0,0.2)",
              },
            }}
          >
            Add Product
          </Button>

          <FormControl 
            size="small" 
            sx={{ 
              minWidth: { xs: "100%", sm: 160 },
              "& .MuiOutlinedInput-root": {
                borderRadius: { xs: 2, sm: 2.5 },
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              sx={{ fontSize: { xs: "0.875rem", sm: "0.938rem" } }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c._id || c.id} value={c.slug}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            size="small" 
            sx={{ 
              minWidth: { xs: "100%", sm: 160 },
              "& .MuiOutlinedInput-root": {
                borderRadius: { xs: 2, sm: 2.5 },
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <InputLabel>Collection</InputLabel>
            <Select
              label="Collection"
              value={collectionFilter}
              onChange={(e) => onCollectionFilterChange(e.target.value)}
              sx={{ fontSize: { xs: "0.875rem", sm: "0.938rem" } }}
            >
              <MenuItem value="">All Collections</MenuItem>
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
        placeholder="Search products by name, category, collection..."
        onChange={(e) => gridRef.current?.api?.setQuickFilter(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          ),
        }}
        sx={{ 
          mb: { xs: 2, sm: 2.5 },
          width: { xs: "100%", sm: "100%", md: 400 },
          "& .MuiOutlinedInput-root": {
            borderRadius: { xs: 2, sm: 2.5 },
            backgroundColor: theme.palette.action.hover,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused": {
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
            },
          },
        }}
      />

      {/* GRID */}
      <Box
        className="ag-theme-quartz"
        sx={{
          width: "100%",
          height: { xs: 500, sm: 580, md: 620 },
          borderRadius: { xs: 2, sm: 2.5 },
          overflow: "hidden",

          /* Grid sizing */
          "--ag-row-height": "72px",
          "--ag-header-height": "60px",
          "--ag-font-size": "14px",

          /* Colors */
          "--ag-border-color": theme.palette.divider,
          "--ag-header-background-color": theme.palette.action.hover,
          "--ag-header-foreground-color": theme.palette.text.primary,

          /* Zebra rows */
          "--ag-odd-row-background-color": theme.palette.background.paper,
          "--ag-even-row-background-color": theme.palette.action.hover,

          /* Hover */
          "--ag-row-hover-color": `${theme.palette.primary.light}15`,

          /* Selection */
          "--ag-selected-row-background-color": `${theme.palette.primary.light}25`,

          /* Font */
          "--ag-font-family": theme.typography.fontFamilyBody || "Inter, Roboto, sans-serif",

          /* Shadow */
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          border: `1px solid ${theme.palette.divider}`,

          /* Header style */
          "& .ag-header-cell-label": {
            fontWeight: 700,
            fontSize: { xs: "0.75rem", sm: "0.813rem" },
            color: theme.palette.text.primary,
          },

          /* Row cells */
          "& .ag-cell": {
            display: "flex",
            alignItems: "center",
            fontSize: { xs: "0.813rem", sm: "0.875rem" },
          },

          /* Remove harsh borders */
          "& .ag-row": {
            borderBottom: `1px solid ${theme.palette.divider}`,
            transition: "all 0.2s ease",
          },

          /* Scrollbar */
          "& ::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "& ::-webkit-scrollbar-track": {
            background: theme.palette.action.hover,
          },
          "& ::-webkit-scrollbar-thumb": {
            background: theme.palette.primary.main,
            borderRadius: "4px",
            "&:hover": {
              background: theme.palette.primary.dark,
            },
          },
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={products}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={10}
          animateRows
          rowHeight={72}
          headerHeight={60}
          getRowId={(params) => String(params.data?._id || params.data?.id)}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 130,
          }}
        />
      </Box>

      {/* DELETE CONFIRMATION */}
      <Dialog 
        open={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2.5, sm: 3 },
            boxShadow: theme.palette.brand?.shadowCardStrong || "0 12px 28px rgba(0,0,0,0.15)",
            minWidth: { xs: "90%", sm: 400 },
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            fontWeight: 600,
            pb: 1,
          }}
        >
          Delete Product?
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: { xs: "0.875rem", sm: "0.938rem" }, color: theme.palette.text.secondary }}>
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, gap: 1 }}>
          <Button 
            onClick={() => setDeleteId(null)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>

          <Button 
            color="error" 
            variant="contained" 
            onClick={confirmDelete}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(211, 47, 47, 0.4)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}