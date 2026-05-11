"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPanel, AdminTableWrap } from "@/components/admin/AdminUi";
import { adminApi } from "@/lib/api";

function stockColor(stock) {
  if (stock === 0) return "error";
  if (stock <= 5) return "warning";
  return "success";
}

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
    setFiltered(inventory.filter((i) => (i.productName || "").toLowerCase().includes(s) || (i.sku || "").toLowerCase().includes(s)));
  }, [search, inventory]);

  const analytics = useMemo(() => {
    const totalStock = inventory.reduce((sum, i) => sum + Number(i.stock || 0), 0);
    return {
      totalStock,
      low: inventory.filter((i) => i.stock <= 5 && i.stock > 0).length,
      out: inventory.filter((i) => i.stock === 0).length,
      warehouses: new Set(inventory.map((i) => i.warehouse || "Primary")).size,
    };
  }, [inventory]);

  const handleChange = (variantId, value) => {
    setFiltered((prev) => prev.map((item) => (item.variantId === variantId ? { ...item, stock: Number(value) } : item)));
  };

  const updateStock = async (variantId) => {
    try {
      const variant = filtered.find((i) => i.variantId === variantId);
      if (!variant) return;
      await adminApi.updateInventory({ variantId, stock: Number(variant.stock) });
      setSuccess("Inventory updated");
      await load();
    } catch (err) {
      setError(err.message || "Failed to update inventory");
    }
  };

  return (
    <AdminGuard>
      <AdminShell title="Inventory Management">
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}


        <AdminPanel title="Variant Inventory">
          <TextField
            size="small"
            placeholder="Search product or SKU..."
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

          <AdminTableWrap maxHeight={680}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Restock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row, idx) => {
                  const status = row.stock === 0 ? "Out of Stock" : row.stock <= 5 ? "Low Stock" : "Healthy";
                  return (
                    <TableRow key={row.variantId || idx} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800 }}>{row.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">SKU: {row.sku || "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.warehouse || "Primary"} color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>{row.size || "-"}</TableCell>
                      <TableCell>{row.color || "-"}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Stack spacing={1}>
                          <TextField type="number" size="small" value={row.stock} onChange={(e) => handleChange(row.variantId, e.target.value)} sx={{ width: 96 }} />
                          <LinearProgress variant="determinate" value={Math.min(100, Number(row.stock || 0) * 5)} color={stockColor(row.stock)} sx={{ height: 8, borderRadius: 99 }} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={stockColor(row.stock)} label={status} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="contained" onClick={() => updateStock(row.variantId)}>
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AdminTableWrap>
        </AdminPanel>
      </AdminShell>
    </AdminGuard>
  );
}
