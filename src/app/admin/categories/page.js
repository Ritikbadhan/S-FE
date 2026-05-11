"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPanel, AdminStatCard, AdminTableWrap } from "@/components/admin/AdminUi";
import { categoriesApi } from "@/lib/api";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  displayOrder: "",
  isActive: true,
};

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = async () => {
    const data = await categoriesApi.list();
    setCategories(data?.categories || data?.data || data || []);
  };

  useEffect(() => {
    loadCategories().catch((err) => setError(err.message || "Failed to load categories"));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return categories;
    const s = search.toLowerCase();
    return categories.filter((category) => `${category.name || ""} ${category.slug || ""} ${category.description || ""}`.toLowerCase().includes(s));
  }, [categories, search]);

  const analytics = useMemo(() => {
    const active = categories.filter((c) => c.isActive ?? true).length;
    const productsCount = categories.reduce((sum, c) => sum + Number(c.productCount || c.productsCount || 0), 0);
    const trending = [...categories].sort((a, b) => Number(b.productCount || b.productsCount || 0) - Number(a.productCount || a.productsCount || 0))[0]?.name || "-";
    return { total: categories.length, active, productsCount, trending };
  }, [categories]);

  const openCreateDialog = () => {
    setEditingId("");
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingId(category._id || category.id);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      displayOrder: category.displayOrder ?? "",
      isActive: category.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, image: "" };
      if (editingId) {
        await categoriesApi.update(editingId, payload);
        setSuccess("Category updated");
      } else {
        await categoriesApi.create(payload);
        setSuccess("Category created");
      }
      setDialogOpen(false);
      setForm(initialForm);
      setEditingId("");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to save category");
    }
  };

  const onDelete = async (id) => {
    try {
      await categoriesApi.remove(id);
      setSuccess("Category deleted");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category");
    }
  };

  return (
    <AdminGuard>
      <AdminShell title="Manage Categories">
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}



        <AdminPanel
          title="Category List"
          action={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>Add Category</Button>}
        >
          <TextField
            size="small"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, width: { xs: "100%", md: 360 }, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          />

          <AdminTableWrap maxHeight={640}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Color Tag</TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((category, index) => {
                  const id = category._id || category.id;
                  return (
                    <TableRow key={id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>{category.name?.charAt(0)?.toUpperCase()}</Avatar>
                          <Typography sx={{ fontWeight: 800 }}>{category.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>{category.description || "-"}</TableCell>
                      <TableCell>
                        <Chip size="small" color={["primary", "success", "warning", "info"][index % 4]} label={`Order ${category.displayOrder ?? "-"}`} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={Boolean(category.isActive)}
                          onChange={async () => {
                            await categoriesApi.update(id, { ...category, isActive: !category.isActive, image: "" });
                            await loadCategories();
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => openEditDialog(category)}><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => onDelete(id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AdminTableWrap>
        </AdminPanel>

       <Dialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: "24px",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
      border: "1px solid #eef2f7",
      background: "#ffffff",
    },
  }}
>
  {/* HEADER */}

  <DialogTitle
    sx={{
      px: 3,
      py: 2.5,
      borderBottom: "1px solid #f1f5f9",
      background: "#ffffff",
    }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {editingId ? "Edit Category" : "Add Category"}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.84rem",
          color: "#64748b",
          mt: 0.5,
        }}
      >
        Manage your category information and settings.
      </Typography>
    </Box>
  </DialogTitle>

  {/* CONTENT */}

  <DialogContent
    sx={{
      px: 3,
      py: 3,
    }}
  >
    <Grid container spacing={2.2}>
      {/* CATEGORY NAME */}

      <Grid item xs={12}>
        <Typography
          sx={{
            mb: 0.8,
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Category Name
        </Typography>

        <TextField
          fullWidth
          placeholder="Enter category name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
              slug: slugify(e.target.value),
            }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 48,
              borderRadius: "14px",
              background: "#ffffff",

              "& fieldset": {
                borderColor: "#e2e8f0",
              },

              "&:hover fieldset": {
                borderColor: "#cbd5e1",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#0f172a",
                borderWidth: "1px",
              },
            },
          }}
        />
      </Grid>

      {/* SLUG */}

      <Grid item xs={12}>
        <Typography
          sx={{
            mb: 0.8,
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Slug
        </Typography>

        <TextField
          fullWidth
          placeholder="category-slug"
          value={form.slug}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              slug: e.target.value,
            }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 48,
              borderRadius: "14px",
              background: "#ffffff",

              "& fieldset": {
                borderColor: "#e2e8f0",
              },

              "&:hover fieldset": {
                borderColor: "#cbd5e1",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#0f172a",
              },
            },
          }}
        />
      </Grid>

      {/* DESCRIPTION */}

      <Grid item xs={12}>
        <Typography
          sx={{
            mb: 0.8,
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Description
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Write category description..."
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              background: "#ffffff",

              "& fieldset": {
                borderColor: "#e2e8f0",
              },

              "&:hover fieldset": {
                borderColor: "#cbd5e1",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#0f172a",
              },
            },
          }}
        />
      </Grid>

      {/* DISPLAY ORDER */}

      <Grid item xs={12}>
        <Typography
          sx={{
            mb: 0.8,
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Display Order
        </Typography>

        <TextField
          type="number"
          fullWidth
          placeholder="0"
          value={form.displayOrder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              displayOrder: e.target.value,
            }))
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 48,
              borderRadius: "14px",
              background: "#ffffff",

              "& fieldset": {
                borderColor: "#e2e8f0",
              },

              "&:hover fieldset": {
                borderColor: "#cbd5e1",
              },

              "&.Mui-focused fieldset": {
                borderColor: "#0f172a",
              },
            },
          }}
        />
      </Grid>
    </Grid>
  </DialogContent>

  {/* FOOTER */}

  <DialogActions
    sx={{
      px: 3,
      py: 2.2,
      borderTop: "1px solid #f1f5f9",
      gap: 1,
    }}
  >
    <Button
      onClick={() => setDialogOpen(false)}
      sx={{
        height: 42,
        px: 2.5,
        borderRadius: "12px",
        textTransform: "none",
        fontWeight: 600,
        color: "#475569",

        "&:hover": {
          background: "#f8fafc",
        },
      }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleSubmit}
      sx={{
        height: 42,
        px: 3,
        borderRadius: "12px",
        textTransform: "none",
        fontWeight: 600,
        boxShadow: "none",

        "&:hover": {
          boxShadow: "none",
        },
      }}
    >
      {editingId ? "Update Category" : "Create Category"}
    </Button>
  </DialogActions>
</Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
