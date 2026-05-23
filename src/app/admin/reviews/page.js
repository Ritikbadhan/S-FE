"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Grid,
  InputAdornment,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPanel, AdminTableWrap } from "@/components/admin/AdminUi";
import { adminApi } from "@/lib/api";

function getReviewStatus(review) {
  if (review?.isHidden) return "Hidden";
  if (review?.isApproved) return "Approved";
  return review?.status || "Pending";
}

function statusColor(status) {
  if (status === "Approved") return "success";
  if (status === "Hidden") return "error";
  return "warning";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    const data = await adminApi.reviews();
    setReviews(data?.reviews || data?.data || data || []);
  };

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        const data = await adminApi.reviews();
        if (active) setReviews(data?.reviews || data?.data || data || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load reviews");
      }
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search) return reviews;
    const s = search.toLowerCase();
    return reviews.filter((review) => `${review.productId || ""} ${review.userName || ""} ${review.comment || review.text || ""}`.toLowerCase().includes(s));
  }, [reviews, search]);

  const analytics = useMemo(() => {
    const avg = reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 0;
    const pending = reviews.filter((r) => getReviewStatus(r) === "Pending").length;
    const negative = reviews.filter((r) => Number(r.rating || 0) <= 2).length;
    return { total: reviews.length, avg, pending, negative };
  }, [reviews]);

  const act = async (id, action, label, payload = {}) => {
    try {
      setError("");
      if (action === "delete") {
        await adminApi.deleteReview(id);
      } else {
        await adminApi.updateReview(id, { action, ...payload });
      }
      setSuccess(label);
      await load();
    } catch (err) {
      setError(err.message || "Action failed");
    }
  };

  return (
    <AdminGuard>
      <AdminShell title="Manage Reviews">
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        <AdminPanel title="Review Moderation">
          <TextField
            size="small"
            placeholder="Search reviews..."
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
                  <TableCell>User</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell>Sentiment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((review) => {
                  const status = getReviewStatus(review);
                  const rating = Number(review.rating || 0);
                  return (
                    <TableRow key={review.id || review._id} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{review.productId}</TableCell>
                      <TableCell>{review.user.name || "-"}</TableCell>
                      <TableCell><Rating size="small" value={rating} readOnly /></TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>{review.comment || review.text || "-"}</TableCell>
                      <TableCell>
                        <Chip size="small" color={rating <= 2 ? "error" : rating >= 4 ? "success" : "warning"} label={rating <= 2 ? "Negative" : rating >= 4 ? "Positive" : "Neutral"} />
                      </TableCell>
                      <TableCell><Chip size="small" color={statusColor(status)} label={status} /></TableCell>
                      <TableCell>{review.isFeatured ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" onClick={() => act(review.id || review._id, "approve", "Review approved")}>Approve</Button>
                          <Button size="small" color="warning" onClick={() => act(review.id || review._id, "hide_abusive", "Review hidden")}>Hide</Button>
                          <Button size="small" onClick={() => act(review.id || review._id, "feature", review.isFeatured ? "Review unfeatured" : "Review featured", { value: !review.isFeatured })}>
                            {review.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button size="small" color="error" onClick={() => act(review.id || review._id, "delete", "Review deleted")}>Delete</Button>
                        </Stack>
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
