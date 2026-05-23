"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  COLLECTION_OPTIONS,
  SIZE_OPTIONS,
} from "./productFormUtils";

const steps = [
  "Product Info",
  "Pricing",
  "Images",
  "Variants",
  "Specifications",
  // "SEO & Flags",
];
const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    height: 56,
    borderRadius: "16px",
    backgroundColor: "#fff",
  },

  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },
};

const textareaStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: "#fff",
    alignItems: "flex-start",
    paddingTop: "8px",
  },
};

export default function ProductEditorTab({
  form,
  formErrors = {},
  categories,
  selectedCategoryValue,
  totalStock,
  uploading,
  dragImageId,
  isEditing,
  onSubmit,
  onBackToList,
  onReset,
  onFieldChange,
  onCategoryChange,
  onImageUpload,
  onImageDragStart,
  onImageDrop,
  onImageRemove,
  onVariantChange,
  onVariantAdd,
  onVariantRemove,
}) {
  const [activeStep, setActiveStep] = useState(0);

  const next = () => setActiveStep((prev) => prev + 1);
  const back = () => setActiveStep((prev) => prev - 1);

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* HEADER */}

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6">
                {isEditing ? "Edit Product" : "Add Product"}
              </Typography>

              <Typography sx={{ opacity: 0.7 }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={onBackToList}>
                Back to Products
              </Button>

              <Button variant="text" onClick={onReset}>
                Reset
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* STEPPER */}

        <Stepper activeStep={activeStep} sx={{ px: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* CONTENT */}

        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#fafafa",
          }}
        >
          {/* STEP 1 PRODUCT INFO */}

          {/* {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={form.name}
                  sx={fieldStyle}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Description"
                  sx={fieldStyle}
                  value={form.description}
                  onChange={(e) =>
                    onFieldChange("description", e.target.value)
                  }
                  error={Boolean(formErrors.description)}
                  helperText={formErrors.description}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel>Category</InputLabel>

                  <Select
                    label="Category"
                    value={selectedCategoryValue}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    error={Boolean(formErrors.category)}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.category ? (
                    <FormHelperText error>{formErrors.category}</FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={fieldStyle}>
                  <InputLabel>Collection</InputLabel>

                  <Select
                    label="Collection"
                    value={form.collection}
                    onChange={(e) =>
                      onFieldChange("collection", e.target.value)
                    }
                    error={Boolean(formErrors.collection)}
                  >
                    {COLLECTION_OPTIONS.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.collection ? (
                    <FormHelperText error>{formErrors.collection}</FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>
            </Grid>
          )} */}
        {activeStep === 0 && (
  <Grid container spacing={3}>
    
    {/* FIRST ROW */}
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Product Name"
        value={form.name}
        onChange={(e) => onFieldChange("name", e.target.value)}
        sx={fieldStyle}
      />
    </Grid>

    <Grid item xs={12} md={8}>
      <FormControl
  fullWidth
  sx={{
    minWidth: 320,
    ...fieldStyle,
  }}
>
        <InputLabel>Category</InputLabel>

        <Select
          label="Category"
          value={selectedCategoryValue}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((c) => (
            <MenuItem key={c._id || c.id} value={c._id || c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    {/* DESCRIPTION */}
    <Grid item xs={12} md={8}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Description"
        value={form.description}
        onChange={(e) =>
          onFieldChange("description", e.target.value)
        }
        sx={textareaStyle}
      />
    </Grid>

    {/* COLLECTION */}
    <Grid item xs={12} md={4}>
      <FormControl
  fullWidth
  sx={{
    minWidth: 260,
    ...fieldStyle,
  }}
>
        <InputLabel>Collection</InputLabel>

        <Select
          label="Collection"
          value={form.collection}
          onChange={(e) =>
            onFieldChange("collection", e.target.value)
          }
        >
          {COLLECTION_OPTIONS.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

  </Grid>
)}

          {/* STEP 2 PRICING */}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  sx={fieldStyle}
                  value={form.price}
                  onChange={(e) => onFieldChange("price", e.target.value)}
                  error={Boolean(formErrors.price)}
                  helperText={formErrors.price}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="MRP"
                  type="number"
                  sx={fieldStyle}
                  value={form.mrp}
                  onChange={(e) => onFieldChange("mrp", e.target.value)}
                  error={Boolean(formErrors.mrp)}
                  helperText={formErrors.mrp}
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 3 IMAGES */}

          {activeStep === 2 && (
            <Stack spacing={2}>
              <Button variant="outlined" component="label">
                Upload Images
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageUpload}
                />
              </Button>

              <Grid container spacing={2}>
                {form.images.map((image, index) => (
                  <Grid item xs={6} sm={4} md={2.4} key={image.id}>
                    <Paper
                      draggable
                      onDragStart={() => onImageDragStart(image.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onImageDrop(dragImageId, image.id)}
                      sx={{
  p: 1.5,
  borderRadius: 3,
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
}}
                    >
                      <Box
                        component="img"
                        src={image.src}
                         sx={{
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 2,
  }}
                      />

                      <Stack
  direction="row"
  alignItems="center"
  justifyContent="space-between"
  sx={{
    mt: 1.5,
    minHeight: 36,
  }}
>
  <Chip
    size="small"
    label={
      index === 0 ? "Thumbnail" : `#${index + 1}`
    }
    sx={{
      minWidth: 90,
      justifyContent: "center",
      fontWeight: 600,
    }}
  />

  <Button
    size="small"
    color="error"
    onClick={() => onImageRemove(image.id)}
    sx={{
      minWidth: 70,
      fontWeight: 600,
    }}
  >
    Remove
  </Button>
</Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {formErrors.images ? (
                <FormHelperText error sx={{ mt: 1 }}>
                  {formErrors.images}
                </FormHelperText>
              ) : null}
            </Stack>
          )}

          {/* STEP 4 VARIANTS */}

          {activeStep === 3 && (
            <Stack spacing={2}>
              {form.variants.map((variant, index) => (
                <Paper key={variant.id} sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Size</InputLabel>

                        <Select
                          label="Size"
                          value={variant.size}
                          onChange={(e) =>
                            onVariantChange(index, "size", e.target.value)
                          }
                            error={Boolean(formErrors[`variant_size_${index}`])}
                        >
                          {SIZE_OPTIONS.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors[`variant_size_${index}`] ? (
                          <FormHelperText error>
                            {formErrors[`variant_size_${index}`]}
                          </FormHelperText>
                        ) : null}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Color"
                        value={variant.color}
                        onChange={(e) =>
                              onVariantChange(index, "color", e.target.value)
                            }
                        error={Boolean(formErrors[`variant_color_${index}`] || formErrors[`variant_duplicate_${index}`])}
                        helperText={formErrors[`variant_color_${index}`] || formErrors[`variant_duplicate_${index}`]}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Stock"
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                              onVariantChange(index, "stock", e.target.value)
                            }
                        error={Boolean(formErrors[`variant_stock_${index}`])}
                        helperText={formErrors[`variant_stock_${index}`]}
                      />
                    </Grid>
                  </Grid>

                  <Stack alignItems="flex-end" sx={{ mt: 1.5 }}>
                    <Button
                      color="error"
                      onClick={() => onVariantRemove(index)}
                    >
                      Remove Variant
                    </Button>
                  </Stack>
                </Paper>
              ))}

              <Button variant="outlined" onClick={onVariantAdd}>
                Add Variant
              </Button>

              <Chip label={`Total Stock: ${totalStock}`} color="primary" />
            </Stack>
          )}

          {/* STEP 5 SPECIFICATIONS */}

          {activeStep === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Material"
                  value={form.material}
                  onChange={(e) =>
                    onFieldChange("material", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fit"
                  value={form.fit}
                  onChange={(e) => onFieldChange("fit", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fabric (GSM)"
                  type="number"
                  value={form.fabric}
                  onChange={(e) =>
                    onFieldChange("fabric", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Neck Line"
                  value={form.neckline}
                  onChange={(e) =>
                    onFieldChange("neckline", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Care Instructions"
                  value={form.careInstructions}
                  onChange={(e) =>
                    onFieldChange("careInstructions", e.target.value)
                  }
                />
              </Grid>
               <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Pattern"
                  value={form.pattern}
                  onChange={(e) =>
                    onFieldChange("pattern", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          )}

          {/* STEP 6 SEO */}

          {/* {activeStep === 5 && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Slug"
                value={form.slug}
                onChange={(e) => onFieldChange("slug", e.target.value)}
              />

              <TextField
                fullWidth
                label="Meta Title"
                value={form.metaTitle}
                onChange={(e) => onFieldChange("metaTitle", e.target.value)}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Meta Description"
                value={form.metaDescription}
                onChange={(e) =>
                  onFieldChange("metaDescription", e.target.value)
                }
              />

              <Stack direction="row" spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isNew}
                      onChange={(e) =>
                        onFieldChange("isNew", e.target.checked)
                      }
                    />
                  }
                  label="New"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isBestSeller}
                      onChange={(e) =>
                        onFieldChange("isBestSeller", e.target.checked)
                      }
                    />
                  }
                  label="Best Seller"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isLimited}
                      onChange={(e) =>
                        onFieldChange("isLimited", e.target.checked)
                      }
                    />
                  }
                  label="Limited"
                />
              </Stack>
            </Stack>
          )} */}
        </Paper>

        {/* NAVIGATION */}

        <Stack direction="row" justifyContent="space-between">
          <Button disabled={activeStep === 0} onClick={back}>
            Back
          </Button>

          {activeStep === steps.length ? (
            <Button type="submit" variant="contained" size="large">
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          ) : (
            <Button variant="contained" onClick={next}>
              {activeStep  ==5 ? "Create Product" : "Next"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}