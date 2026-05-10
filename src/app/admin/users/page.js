"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);

  const loadUsers = async () => {
    const data = await adminApi.users();
    setUsers(data?.users || data?.data || data || []);
  };

  useEffect(() => {
    loadUsers().catch((err) =>
      setError(err.message || "Failed to load users")
    );
  }, []);

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
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Users
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Rewards</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => {
                const id = user._id || user.id;
                const role = user.role || "user";
                const isAdmin = role === "admin";

                return (
                  <TableRow key={id} hover>
                    {/* USER */}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36 }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {user.name || "-"}
                          </Typography>

                          <Typography sx={{ fontSize: 13, opacity: 0.7 }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* PHONE */}
                    <TableCell>{user.phone || "-"}</TableCell>

                    {/* ROLE */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={role}
                        color={isAdmin ? "primary" : "default"}
                      />
                    </TableCell>

                    {/* REWARDS */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={`${user.rewards?.points || 0} pts`}
                        />
                        <Chip
                          size="small"
                          color="secondary"
                          label={user.rewards?.tier || "Bronze"}
                        />
                      </Stack>
                    </TableCell>

                    {/* EMAIL VERIFIED */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.emailVerified ? "Verified" : "Not Verified"}
                        color={user.emailVerified ? "success" : "default"}
                      />
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.isBlocked ? "Blocked" : "Active"}
                        color={user.isBlocked ? "error" : "success"}
                      />
                    </TableCell>

                    {/* JOINED */}
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {!isAdmin && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => promote(id)}
                          >
                            Promote
                          </Button>
                        )}

                        <Button
                          size="small"
                          color={user.isBlocked ? "success" : "warning"}
                          onClick={() => setConfirmUser(user)}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>

                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* CONFIRM BLOCK */}

        <Dialog
          open={Boolean(confirmUser)}
          onClose={() => setConfirmUser(null)}
        >
          <DialogTitle>
            {confirmUser?.isBlocked ? "Unblock User" : "Block User"}
          </DialogTitle>

          <DialogContent>
            <Typography>
              Are you sure you want to{" "}
              {confirmUser?.isBlocked ? "unblock" : "block"}{" "}
              <b>{confirmUser?.name}</b>?
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setConfirmUser(null)}>Cancel</Button>

            <Button
              variant="contained"
              color={confirmUser?.isBlocked ? "success" : "error"}
              onClick={() =>
                blockUser(confirmUser._id, !confirmUser.isBlocked)
              }
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </AdminShell>
    </AdminGuard>
  );
}
