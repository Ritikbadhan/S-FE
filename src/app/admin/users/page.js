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
  InputAdornment,
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SearchIcon from "@mui/icons-material/Search";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPanel, AdminStatCard, AdminTableWrap } from "@/components/admin/AdminUi";
import { adminApi } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);

  const loadUsers = async () => {
    const data = await adminApi.users();
    setUsers(data?.users || data?.data || data || []);
  };

  useEffect(() => {
    loadUsers().catch((err) => setError(err.message || "Failed to load users"));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter((user) => `${user.name || ""} ${user.email || ""} ${user.phone || ""}`.toLowerCase().includes(s));
  }, [users, search]);

  const analytics = useMemo(() => {
    const active = users.filter((u) => !u.isBlocked).length;
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const fresh = users.filter((u) => new Date(u.createdAt).getTime() >= since).length;
    const vip = users.filter((u) => ["Gold", "Platinum", "VIP"].includes(u.rewards?.tier)).length;
    return { total: users.length, active, fresh, vip };
  }, [users]);

  const promote = async (userId) => {
    try {
      setError("");
      await adminApi.promote({ userId });
      setSuccess("User promoted to admin");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to promote user");
    }
  };

  const blockUser = async (userId, value) => {
    try {
      setError("");
      await adminApi.updateUser(userId, { action: "block", value });
      setSuccess(value ? "User blocked" : "User unblocked");
      setConfirmUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  };

  return (
    <AdminGuard>
      <AdminShell title="Manage Users">
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        <AdminPanel title="Customers">
          <TextField
            size="small"
            placeholder="Search customers..."
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
                  <TableCell>User</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Loyalty</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => {
                  const id = user._id || user.id;
                  const role = user.role || "user";
                  const isAdmin = role === "admin";

                  return (
                    <TableRow key={id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 42, height: 42, bgcolor: isAdmin ? "primary.main" : "info.main", fontWeight: 800 }}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 800 }}>{user.name || "-"}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell><Chip size="small" label={role} color={isAdmin ? "primary" : "default"} sx={{ fontWeight: 700 }} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Chip size="small" label={`${user.rewards?.points || 0} pts`} />
                          <Chip size="small" color="secondary" label={user.rewards?.tier || "Bronze"} />
                        </Stack>
                      </TableCell>
                      <TableCell><Chip size="small" label={user.emailVerified ? "Verified" : "Not Verified"} color={user.emailVerified ? "success" : "default"} /></TableCell>
                      <TableCell><Chip size="small" label={user.isBlocked ? "Blocked" : "Online"} color={user.isBlocked ? "error" : "success"} /></TableCell>
                      <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {!isAdmin ? <Button size="small" variant="outlined" onClick={() => promote(id)}>Promote</Button> : null}
                          <Button size="small" color={user.isBlocked ? "success" : "warning"} onClick={() => setConfirmUser(user)}>
                            {user.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AdminTableWrap>
        </AdminPanel>

        <Dialog open={Boolean(confirmUser)} onClose={() => setConfirmUser(null)} PaperProps={{ sx: { borderRadius: 6 } }}>
          <DialogTitle>{confirmUser?.isBlocked ? "Unblock User" : "Block User"}</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {confirmUser?.isBlocked ? "unblock" : "block"} <b>{confirmUser?.name}</b>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmUser(null)}>Cancel</Button>
            <Button variant="contained" color={confirmUser?.isBlocked ? "success" : "error"} onClick={() => blockUser(confirmUser._id || confirmUser.id, !confirmUser.isBlocked)}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
