"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    const data = await adminApi.inventory();
    const list = data?.inventory || data?.data || data || [];

    setInventory(list);
    setFiltered(list);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message || "Failed to load inventory"));
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(inventory);
      return;
    }

    const s = search.toLowerCase();

    setFiltered(
      inventory.filter((i) => (i.productName || "").toLowerCase().includes(s)),
    );
  }, [search, inventory]);

  const analytics = useMemo(() => {
    return {
      total: inventory.length,
      low: inventory.filter((i) => i.stock <= 5 && i.stock > 0).length,
      out: inventory.filter((i) => i.stock === 0).length,
    };
  }, [inventory]);

  const handleChange = (variantId, value) => {
    setFiltered((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, stock: Number(value) } : item,
      ),
    );
  };

  const updateStock = async (variantId) => {
    try {
      const variant = filtered.find((i) => i.variantId === variantId);
      if (!variant) return;

      await adminApi.updateInventory({
        variantId,
        stock: Number(variant.stock),
      });

      setSuccess("Inventory updated");
      await load();
    } catch (err) {
      setError(err.message || "Failed to update inventory");
    }
  };

  return (
    <AdminGuard>
      <AdminShell title="Inventory Management">
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* ANALYTICS */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Total Variants</Typography>
            <Typography variant="h6">{analytics.total}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography>Low Stock</Typography>
            <Typography variant="h6">{analytics.low}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography>Out of Stock</Typography>
            <Typography variant="h6">{analytics.out}</Typography>
          </Paper>
        </Stack>

        {/* SEARCH */}
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Stack>

        {/* TABLE */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Variant Inventory
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Save</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {row.productName}
                    <Typography variant="caption" display="block">
                      SKU: {row.sku || "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>{row.size || "-"}</TableCell>
                  <TableCell>{row.color || "-"}</TableCell>

                  {/* STOCK INPUT */}
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={row.stock}
                      onChange={(e) =>
                        handleChange(row.variantId, e.target.value)
                      }
                      sx={{ width: 90 }}
                    />
                  </TableCell>

                  {/* STOCK STATUS */}
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color:
                          row.stock === 0
                            ? "error.main"
                            : row.stock <= 5
                              ? "warning.main"
                              : "success.main",
                      }}
                    >
                      {row.stock === 0
                        ? "Out of Stock"
                        : row.stock <= 5
                          ? "Low Stock"
                          : "Healthy"}
                    </Typography>
                  </TableCell>

                  {/* SAVE */}
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => updateStock(row.variantId)}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </AdminShell>
    </AdminGuard>
  );
}
