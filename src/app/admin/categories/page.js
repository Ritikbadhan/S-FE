"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { categoriesApi } from "@/lib/api";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  displayOrder: "",
  isActive: true,
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = async () => {
    const data = await categoriesApi.list();
    setCategories(data?.categories || data?.data || data || []);
  };

  useEffect(() => {
    loadCategories().catch((err) =>
      setError(err.message || "Failed to load categories"),
    );
  }, []);

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
      const payload = {
        ...form,
        image: "", // always pass empty image
      };

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
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* HEADER */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Category List</Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Add Category
          </Button>
        </Stack>

        {/* TABLE */}
        <Paper sx={{ p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Order</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {categories.map((category) => {
                const id = category._id || category.id;

                return (
                  <TableRow key={id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {category.name}
                    </TableCell>

                    <TableCell>{category.slug}</TableCell>

                    <TableCell sx={{ maxWidth: 260 }}>
                      {category.description || "-"}
                    </TableCell>

                    <TableCell>{category.displayOrder ?? "-"}</TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={Boolean(category.isActive)}
                        onChange={async () => {
                          await categoriesApi.update(id, {
                            ...category,
                            isActive: !category.isActive,
                            image: "",
                          });

                          await loadCategories();
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => openEditDialog(category)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => onDelete(id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* DIALOG */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingId ? "Edit Category" : "Add Category"}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Category Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: slugify(e.target.value),
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Slug"
                  fullWidth
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Display Order"
                  type="number"
                  fullWidth
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      displayOrder: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>

            <Button variant="contained" onClick={handleSubmit}>
              {editingId ? "Update Category" : "Create Category"}
            </Button>
          </DialogActions>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}