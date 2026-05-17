"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPanel, AdminStatCard } from "@/components/admin/AdminUi";
import { adminApi, productsApi } from "@/lib/api";

ModuleRegistry.registerModules([AllCommunityModule]);

const finalStatuses = ["Approved", "Accepted", "Completed", "Rejected", "Declined", "Cancelled"];

function normalizeStatus(status) {
  const value = String(status || "Requested").trim();
  if (!value) return "Requested";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function statusColor(status) {
  const value = normalizeStatus(status);
  if (["Approved", "Accepted", "Completed"].includes(value)) return "success";
  if (["Rejected", "Declined", "Cancelled"].includes(value)) return "error";
  if (["Requested", "Pending", "Reviewing"].includes(value)) return "warning";
  return "default";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatReason(reason) {
  return String(reason || "-")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeReturns(data) {
  const root = data?.returns || data?.data?.returns || data?.data || data;
  return Array.isArray(root) ? root : [];
}

function getUserName(entry, usersById) {
  const user = entry?.user || entry?.userId || entry?.customer;
  const userId = typeof entry?.userId === "string" ? entry.userId : user?._id || user?.id;
  const resolvedUser = usersById.get(String(userId || ""));
  return (
    user?.name ||
    entry?.userName ||
    entry?.customerName ||
    resolvedUser?.name ||
    resolvedUser?.email ||
    "-"
  );
}

function getOrderId(entry) {
  const order = entry?.order || entry?.orderId;
  return order?._id || order?.id || entry?.orderId || "";
}

function getOrderItems(order) {
  return order?.items || order?.products || order?.orderItems || [];
}

function getProductId(entry) {
  const product = entry?.product || entry?.productId || entry?.item?.product;
  return (
    typeof entry?.productId === "string"
      ? entry.productId
      : product?._id || product?.id || entry?.item?.productId || entry?.product?._id || entry?.product?.id || ""
  );
}

function getOrderProductName(entry, ordersById) {
  const order = ordersById.get(String(getOrderId(entry) || ""));
  const productId = String(getProductId(entry) || "");
  const items = getOrderItems(order);
  const item =
    items.find((orderItem) => {
      const itemProduct = orderItem?.product || orderItem?.productId;
      const itemProductId =
        typeof itemProduct === "string"
          ? itemProduct
          : itemProduct?._id || itemProduct?.id || orderItem?.productId || orderItem?.id;
      return String(itemProductId || "") === productId;
    }) || (items.length === 1 ? items[0] : null);

  const itemProduct = item?.product || item?.productId;
  return item?.name || item?.productName || itemProduct?.name || "";
}

function findOrderItem(entry, ordersById) {
  const order = ordersById.get(String(getOrderId(entry) || ""));
  const productId = String(getProductId(entry) || "");
  const items = getOrderItems(order);
  return (
    items.find((orderItem) => {
      const itemProduct = orderItem?.product || orderItem?.productId;
      const itemProductId =
        typeof itemProduct === "string"
          ? itemProduct
          : itemProduct?._id || itemProduct?.id || orderItem?.productId || orderItem?.id;
      return String(itemProductId || "") === productId;
    }) || (items.length === 1 ? items[0] : null)
  );
}

function getResolvedProduct(entry, productsById, products, ordersById) {
  const productId = getProductId(entry);
  const directProduct = productsById.get(String(productId || ""));
  if (directProduct) return directProduct;

  const orderItem = findOrderItem(entry, ordersById);
  const orderItemProduct = orderItem?.product || orderItem?.productId;
  const orderItemProductId =
    typeof orderItemProduct === "string"
      ? orderItemProduct
      : orderItemProduct?._id || orderItemProduct?.id || orderItem?.productId;
  const orderProduct = productsById.get(String(orderItemProductId || ""));
  if (orderProduct) return orderProduct;

  const name =
    entry?.productName ||
    entry?.item?.name ||
    orderItem?.name ||
    orderItem?.productName ||
    orderItemProduct?.name ||
    "";
  if (!name) return null;

  return (
    products.find(
      (product) => String(product?.name || "").toLowerCase() === String(name).toLowerCase()
    ) || null
  );
}

function getProductName(entry, productsById, ordersById) {
  const product = entry?.product || entry?.productId || entry?.item?.product;
  const productId = getProductId(entry);
  const resolvedProduct = productsById.get(String(productId || ""));
  return (
    product?.name ||
    entry?.productName ||
    entry?.item?.name ||
    resolvedProduct?.name ||
    getOrderProductName(entry, ordersById) ||
    "Product not found"
  );
}

export default function AdminReturnsPage() {
  const theme = useTheme();
  const gridRef = useRef(null);
  const [returns, setReturns] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadReturns = async () => {
    const data = await adminApi.returns();
    setReturns(normalizeReturns(data));
  };

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        const [returnsData, usersData, productsData, ordersData] = await Promise.all([
          adminApi.returns(),
          adminApi.users(),
          productsApi.list(),
          adminApi.orders(),
        ]);
        if (active) {
          setReturns(normalizeReturns(returnsData));
          setUsers(usersData?.users || usersData?.data || usersData || []);
          setProducts(productsData?.products || productsData?.data || productsData || []);
          setOrders(ordersData?.orders || ordersData?.data || ordersData || []);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load returns");
      }
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  const usersById = useMemo(
    () => new Map(users.map((user) => [String(user?._id || user?.id || ""), user])),
    [users]
  );

  const productsById = useMemo(
    () =>
      new Map(
        products.map((product) => [
          String(product?._id || product?.id || product?.productId || ""),
          product,
        ])
      ),
    [products]
  );

  const ordersById = useMemo(
    () => new Map(orders.map((order) => [String(order?._id || order?.id || ""), order])),
    [orders]
  );

  const rowData = useMemo(
    () =>
      returns.map((entry) => {
        const productId = getProductId(entry);
        const resolvedProduct = getResolvedProduct(entry, productsById, products, ordersById);
        const productLinkId =
          resolvedProduct?.slug ||
          resolvedProduct?._id ||
          resolvedProduct?.id ||
          resolvedProduct?.productId ||
          "";

        return {
          id: entry._id || entry.id || entry.returnId,
          userName: getUserName(entry, usersById),
          orderId: getOrderId(entry) || "-",
          productId,
          productLinkId,
          productName: getProductName(entry, productsById, ordersById),
          reason: entry.reason || "-",
          reasonLabel: formatReason(entry.reason),
          comment: entry.comment || "",
          status: normalizeStatus(entry.status),
          createdAt: entry.createdAt || "",
          updatedAt: entry.updatedAt || "",
        };
      }),
    [ordersById, products, productsById, returns, usersById]
  );

  const filteredRows = useMemo(() => {
    let result = [...rowData];
    if (statusFilter) {
      result = result.filter((entry) => {
        if (statusFilter === "Approved") return ["Approved", "Accepted", "Completed"].includes(entry.status);
        if (statusFilter === "Rejected") return ["Rejected", "Declined", "Cancelled"].includes(entry.status);
        return entry.status === statusFilter;
      });
    }
    return result;
  }, [rowData, statusFilter]);

  const analytics = useMemo(() => {
    const pending = rowData.filter((entry) => ["Requested", "Pending", "Reviewing"].includes(entry.status)).length;
    const approved = rowData.filter((entry) => ["Approved", "Accepted", "Completed"].includes(entry.status)).length;
    const rejected = rowData.filter((entry) => ["Rejected", "Declined", "Cancelled"].includes(entry.status)).length;
    return { total: rowData.length, pending, approved, rejected };
  }, [rowData]);

  const act = async (id, type) => {
    if (!id) return;
    try {
      setBusyId(id);
      setError("");
      setSuccess("");
      if (type === "accept") {
        await adminApi.acceptReturn(id);
        setSuccess("Return accepted successfully");
      } else {
        await adminApi.rejectReturn(id);
        setSuccess("Return rejected successfully");
      }
      await loadReturns();
    } catch (err) {
      setError(err.message || "Return action failed");
    } finally {
      setBusyId("");
    }
  };

  const columnDefs = useMemo(
    () => [
      // {
      //   field: "id",
      //   headerName: "Return ID",
      //   minWidth: 190,
      //   pinned: "left",
      //   cellRenderer: ({ value }) => (
      //     <Typography sx={{ fontWeight: 800, color: "primary.dark", fontSize: "0.84rem" }}>
      //       {String(value || "-")}
      //     </Typography>
      //   ),
      // },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        cellRenderer: ({ value }) => (
          <Chip size="small" label={value} color={statusColor(value)} sx={{ fontWeight: 700 }} />
        ),
      },
      {
        field: "reasonLabel",
        headerName: "Reason",
        minWidth: 160,
        cellRenderer: ({ value }) => <Typography sx={{ fontWeight: 700 }}>{value}</Typography>,
      },
      {
        field: "comment",
        headerName: "Comment",
        minWidth: 180,
        flex: 1,
        valueGetter: ({ data }) => data?.comment || "-",
      },
      // {
      //   field: "orderId",
      //   headerName: "Order ID",
      //   minWidth: 190,
      //   cellRenderer: ({ value }) => <Typography sx={{ fontSize: "0.82rem" }}>{value}</Typography>,
      // },
      {
        field: "userName",
        headerName: "Customer",
        minWidth: 170,
        cellRenderer: ({ value }) => <Typography sx={{ fontWeight: 700 }}>{value || "-"}</Typography>,
      },
      {
        field: "productName",
        headerName: "Product",
        minWidth: 230,
        flex: 1,
        cellRenderer: ({ value, data }) => (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
              {value || "-"}
            </Typography>
            {data?.productLinkId ? (
              <Tooltip title="View product">
                <IconButton
                  component={Link}
                  href={`/shop/${encodeURIComponent(data.productLinkId)}`}
                  size="small"
                  sx={{ flexShrink: 0 }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ),
      },
      {
        field: "createdAt",
        headerName: "Requested",
        width: 150,
        valueFormatter: ({ value }) => formatDate(value),
        comparator: (a, b) => new Date(a || 0).getTime() - new Date(b || 0).getTime(),
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 150,
        valueFormatter: ({ value }) => formatDate(value),
        comparator: (a, b) => new Date(a || 0).getTime() - new Date(b || 0).getTime(),
      },
      {
        headerName: "Actions",
        width: 190,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: ({ data }) => {
          const disabled = busyId === data?.id || finalStatuses.includes(data?.status);
          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
              <Button
                size="small"
                color="success"
                variant="contained"
                disabled={disabled}
                onClick={() => act(data?.id, "accept")}
                sx={{ minWidth: 72 }}
              >
                Accept
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                disabled={disabled}
                onClick={() => act(data?.id, "reject")}
                sx={{ minWidth: 68 }}
              >
                Reject
              </Button>
            </Stack>
          );
        },
      },
    ],
    [busyId]
  );

  return (
    <AdminGuard>
      <AdminShell title="Manage Returns">
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} lg={3}>
            <AdminStatCard label="Total Returns" value={analytics.total} icon={<AssignmentReturnIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <AdminStatCard label="Pending Review" value={analytics.pending} tone="warning" icon={<HourglassTopIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <AdminStatCard label="Approved" value={analytics.approved} tone="success" icon={<CheckCircleIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <AdminStatCard label="Rejected" value={analytics.rejected} tone="error" icon={<CancelIcon />} />
          </Grid>
        </Grid>

        <AdminPanel title="Return Requests" sx={{ mt: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search return, order, user, product, reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                gridRef.current?.api?.setGridOption("quickFilterText", e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { md: 420 }, "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 190, borderRadius: 4 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Requested">Requested</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Reviewing">Reviewing</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </Stack>

          <Box
            className="ag-theme-quartz"
            sx={{
              height: 620,
              width: "100%",
              "--ag-border-radius": "15px",
              "--ag-header-height": "56px",
              "--ag-row-height": "68px",
              "--ag-font-family": theme.typography.fontFamily,
              "--ag-foreground-color": theme.palette.text.primary,
              "--ag-background-color": theme.palette.background.paper,
              "--ag-header-background-color": theme.palette.action.hover,
              "--ag-border-color": theme.palette.divider,
              "& .ag-root-wrapper": {
                borderRadius: "15px",
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
              },
              "& .ag-header-cell-text": {
                fontWeight: 800,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: theme.palette.text.secondary,
              },
              "& .ag-cell": {
                display: "flex",
                alignItems: "center",
                fontSize: "0.875rem",
              },
            }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={filteredRows}
              columnDefs={columnDefs}
              pagination
              paginationPageSize={10}
              animateRows
              rowHeight={68}
              headerHeight={56}
              getRowId={(params) => String(params.data?.id)}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                floatingFilter: true,
                minWidth: 130,
              }}
            />
          </Box>
        </AdminPanel>
      </AdminShell>
    </AdminGuard>
  );
}
