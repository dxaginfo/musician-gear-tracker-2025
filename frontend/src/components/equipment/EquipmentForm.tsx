import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Rating,
  Stack,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface SpecificationField {
  id: string;
  name: string;
  value: string;
}

export interface EquipmentFormData {
  id?: string;
  name: string;
  categoryId: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date | null;
  purchasePrice: string;
  currentValue: string;
  conditionRating: number;
  notes: string;
  specifications: SpecificationField[];
  images: { id?: string; url: string; isPrimary: boolean }[];
}

interface EquipmentFormProps {
  initialData?: Partial<EquipmentFormData>;
  onSubmit: (values: EquipmentFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

const emptySpec = (): SpecificationField => ({
  id: `spec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  name: '',
  value: ''
});

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  categoryId: Yup.string().required('Category is required'),
  brand: Yup.string(),
  model: Yup.string(),
  serialNumber: Yup.string(),
  purchaseDate: Yup.date().nullable(),
  purchasePrice: Yup.number().typeError('Must be a number').nullable(),
  currentValue: Yup.number().typeError('Must be a number').nullable(),
  conditionRating: Yup.number().min(1).max(10).required('Condition rating is required'),
  notes: Yup.string(),
  specifications: Yup.array().of(
    Yup.object({
      id: Yup.string().required(),
      name: Yup.string().required('Specification name is required'),
      value: Yup.string().required('Specification value is required')
    })
  ),
  images: Yup.array().of(
    Yup.object({
      url: Yup.string().required('Image URL is required'),
      isPrimary: Yup.boolean().required()
    })
  )
});

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  initialData = {},
  onSubmit,
  isSubmitting,
  error
}) => {
  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  const defaultValues: EquipmentFormData = {
    name: '',
    categoryId: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: null,
    purchasePrice: '',
    currentValue: '',
    conditionRating: 5,
    notes: '',
    specifications: [emptySpec()],
    images: [],
    ...initialData
  };

  const formik = useFormik({
    initialValues: defaultValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  const addSpecification = () => {
    formik.setFieldValue('specifications', [
      ...formik.values.specifications,
      emptySpec()
    ]);
  };

  const removeSpecification = (id: string) => {
    formik.setFieldValue(
      'specifications',
      formik.values.specifications.filter((spec) => spec.id !== id)
    );
  };

  // Handle image uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: (acceptedFiles) => {
      // In a real app, we would upload these files to S3 or another storage service
      // and then add the URLs to the form. For this example, we'll create object URLs.
      const newImages = acceptedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        isPrimary: formik.values.images.length === 0 // First image is primary by default
      }));

      formik.setFieldValue('images', [...formik.values.images, ...newImages]);
    }
  });

  const setAsPrimaryImage = (index: number) => {
    const updatedImages = formik.values.images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index
    }));
    formik.setFieldValue('images', updatedImages);
  };

  const removeImage = (index: number) => {
    const newImages = [...formik.values.images];
    newImages.splice(index, 1);
    
    // If we removed the primary image and there are still images left, make the first one primary
    if (formik.values.images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    formik.setFieldValue('images', newImages);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Equipment Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="categoryId"
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category"
                  required
                  disabled={categoriesLoading}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.categoryId && formik.errors.categoryId && (
                  <FormHelperText>{formik.errors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formik.values.brand}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={formik.values.model}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={formik.values.serialNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.serialNumber && Boolean(formik.errors.serialNumber)}
                helperText={formik.touched.serialNumber && formik.errors.serialNumber}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Purchase & Value Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date"
                  value={formik.values.purchaseDate}
                  onChange={(newValue) => {
                    formik.setFieldValue('purchaseDate', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.purchaseDate && Boolean(formik.errors.purchaseDate),
                      helperText: formik.touched.purchaseDate && formik.errors.purchaseDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Purchase Price"
                name="purchasePrice"
                value={formik.values.purchasePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.purchasePrice && Boolean(formik.errors.purchasePrice)}
                helperText={formik.touched.purchasePrice && formik.errors.purchasePrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Current Value"
                name="currentValue"
                value={formik.values.currentValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.currentValue && Boolean(formik.errors.currentValue)}
                helperText={formik.touched.currentValue && formik.errors.currentValue}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="legend">Condition Rating (1-10)</Typography>
                <Rating
                  name="conditionRating"
                  value={formik.values.conditionRating}
                  max={10}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('conditionRating', newValue);
                  }}
                />
                {formik.touched.conditionRating && formik.errors.conditionRating && (
                  <FormHelperText error>{formik.errors.conditionRating}</FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Technical Specifications</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addSpecification}
              variant="outlined"
              size="small"
            >
              Add Specification
            </Button>
          </Box>
          
          {formik.values.specifications.map((spec, index) => (
            <Box key={spec.id} sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Specification Name"
                    name={`specifications[${index}].name`}
                    value={spec.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.specifications?.[index]?.name && 
                      Boolean(formik.errors.specifications?.[index]?.name)
                    }
                    helperText={
                      formik.touched.specifications?.[index]?.name && 
                      formik.errors.specifications?.[index]?.name
                    }
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Value"
                    name={`specifications[${index}].value`}
                    value={spec.value}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.specifications?.[index]?.value && 
                      Boolean(formik.errors.specifications?.[index]?.value)
                    }
                    helperText={
                      formik.touched.specifications?.[index]?.value && 
                      formik.errors.specifications?.[index]?.value
                    }
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton 
                    color="error" 
                    onClick={() => removeSpecification(spec.id)}
                    disabled={formik.values.specifications.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Images
          </Typography>
          
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              mb: 3,
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <PhotoCameraIcon fontSize="large" color="action" />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Drag & drop images here, or click to select files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: JPEG, PNG, GIF
            </Typography>
          </Box>

          {formik.values.images.length > 0 && (
            <Grid container spacing={2}>
              {formik.values.images.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Card>
                    <Box
                      component="img"
                      src={image.url}
                      alt={`Equipment image ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderBottom: image.isPrimary ? '3px solid' : 'none',
                        borderColor: 'primary.main',
                      }}
                    />
                    <Box sx={{ p: 1 }}>
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Button
                          size="small"
                          variant={image.isPrimary ? "contained" : "outlined"}
                          onClick={() => setAsPrimaryImage(index)}
                          disabled={image.isPrimary}
                        >
                          {image.isPrimary ? 'Primary' : 'Set Primary'}
                        </Button>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => removeImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Notes"
            name="notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.notes && Boolean(formik.errors.notes)}
            helperText={formik.touched.notes && formik.errors.notes}
          />
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {initialData.id ? 'Update Equipment' : 'Add Equipment'}
        </Button>
      </Box>
    </form>
  );
};

export default EquipmentForm;