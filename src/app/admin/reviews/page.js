"use client";

import { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/api";

function getReviewStatus(review) {
  if (review?.isHidden) return "Hidden";
  if (review?.isApproved) return "Approved";
  return review?.status || "Pending";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
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
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Reviews
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.productId}</TableCell>
                  <TableCell>{review.userName || "-"}</TableCell>
                  <TableCell>{review.rating || 0}</TableCell>
                  <TableCell>{review.comment || review.text || "-"}</TableCell>
                  <TableCell>{getReviewStatus(review)}</TableCell>
                  <TableCell>{review.isFeatured ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => act(review.id, "approve", "Review approved")}>
                        Approve
                      </Button>
                      <Button size="small" color="warning" onClick={() => act(review.id, "hide_abusive", "Review hidden")}>
                        Hide Abusive
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          act(review.id, "feature", review.isFeatured ? "Review unfeatured" : "Review featured", {
                            value: !review.isFeatured,
                          })
                        }
                      >
                        {review.isFeatured ? "Unfeature" : "Feature"}
                      </Button>
                      <Button size="small" color="error" onClick={() => act(review.id, "delete", "Review deleted")}>
                        Delete
                      </Button>
                    </Stack>
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
