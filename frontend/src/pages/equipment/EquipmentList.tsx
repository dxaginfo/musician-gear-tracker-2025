import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Divider, 
  FormControl, 
  Grid, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  Pagination,
  Chip,
  Avatar,
  Stack,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Clear as ClearIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import CategoryFilter from '../../components/equipment/CategoryFilter';
import SortControl from '../../components/equipment/SortControl';
import { RootState, AppDispatch } from '../../redux/store';
import { 
  fetchEquipment, 
  setSearchTerm, 
  setCategoryFilter, 
  setSortBy, 
  setSortOrder, 
  setPage 
} from '../../redux/slices/equipmentSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';

const EquipmentList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    items,
    totalItems,
    totalPages,
    page,
    loading,
    error,
    searchTerm,
    categoryId,
    sortBy,
    sortOrder
  } = useSelector((state: RootState) => state.equipment);
  
  const { categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    // Load equipment and categories when component mounts
    dispatch(fetchEquipment());
    dispatch(fetchCategories());
  }, [dispatch, page, categoryId, searchTerm, sortBy, sortOrder]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handleClearSearch = () => {
    dispatch(setSearchTerm(''));
  };

  const handleCategoryChange = (id: string | null) => {
    dispatch(setCategoryFilter(id));
  };

  const handleSortChange = (sortByField: string, sortOrderValue: 'ASC' | 'DESC') => {
    dispatch(setSortBy(sortByField));
    dispatch(setSortOrder(sortOrderValue));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Equipment Inventory
        </Typography>
        <Button
          component={RouterLink}
          to="/equipment/add"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add Equipment
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Equipment"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CategoryFilter 
                categories={categories}
                selectedCategoryId={categoryId}
                onChange={handleCategoryChange}
                loading={categoriesLoading}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SortControl
                sortBy={sortBy}
                sortOrder={sortOrder}
                onChange={handleSortChange}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'brand', label: 'Brand' },
                  { value: 'purchase_date', label: 'Purchase Date' },
                  { value: 'condition_rating', label: 'Condition' },
                  { value: 'current_value', label: 'Current Value' }
                ]}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => dispatch(fetchEquipment())}
          >
            Try Again
          </Button>
        </Box>
      ) : items.length === 0 ? (
        <Box 
          sx={{ 
            py: 8, 
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No equipment found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || categoryId ? 
              'Try adjusting your search or filters' : 
              'Start by adding your first piece of equipment'
            }
          </Typography>
          <Button
            component={RouterLink}
            to="/equipment/add"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Equipment
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {items.length} of {totalItems} items
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {items.map((equipment) => (
              <Grid item xs={12} sm={6} md={4} key={equipment.id}>
                <EquipmentCard equipment={equipment} />
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default EquipmentList;