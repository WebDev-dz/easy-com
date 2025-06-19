import { useState, useCallback } from 'react';
import { Category, Product, Supplier } from '@/services/types';

// Types
export interface FilterState {
  searchQuery: string;
  minPrice: string;
  maxPrice: string;
  selectedCategory?: Category;
  selectedSupplierType: string;
  sortBy: string;
  showFilterModal: boolean;
}

export interface FilterConfig {
  supplierTypes?: string[];
  sortOptions?: string[];
}

export interface UseFiltersResult {
  filterState: FilterState;
  setSearchQuery: (query: string) => void;
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
  setSelectedCategory: (category?: Category) => void;
  setSelectedSupplierType: (type: string) => void;
  setSortBy: (sort: string) => void;
  setShowFilterModal: (show: boolean) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  filteredProducts: (products: Product[]) => Product[];
  filteredSuppliers: (suppliers: Supplier[]) => Supplier[];
  sortedProducts: (products: Product[]) => Product[];
  sortedSuppliers: (suppliers: Supplier[]) => Supplier[];
}

// Default configuration
const defaultConfig: FilterConfig = {
  supplierTypes: ['All', 'Workshop', 'Importer', 'Merchant'],
  sortOptions: [
    'Most Recent',
    'Popularity',
    'Price: Low to High',
    'Price: High to Low',
    'Alphabetical',
  ],
};

export const useFilters = (config: FilterConfig = defaultConfig): UseFiltersResult => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    selectedCategory: undefined,
    selectedSupplierType: '',
    sortBy: '',
    showFilterModal: false,
  });

  // Setters for filter state
  const setSearchQuery = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setMinPrice = useCallback((price: string) => {
    setFilterState((prev) => ({ ...prev, minPrice: price }));
  }, []);

  const setMaxPrice = useCallback((price: string) => {
    setFilterState((prev) => ({ ...prev, maxPrice: price }));
  }, []);

  const setSelectedCategory = useCallback((category?: Category) => {
    setFilterState((prev) => ({ ...prev, selectedCategory: category }));
  }, []);

  const setSelectedSupplierType = useCallback((type: string) => {
    setFilterState((prev) => ({ ...prev, selectedSupplierType: type }));
  }, []);

  const setSortBy = useCallback((sort: string) => {
    setFilterState((prev) => ({ ...prev, sortBy: sort }));
  }, []);

  const setShowFilterModal = useCallback((show: boolean) => {
    setFilterState((prev) => ({ ...prev, showFilterModal: show }));
  }, []);

  // Apply filters (closes modal)
  const applyFilters = useCallback(() => {
    setFilterState((prev) => ({ ...prev, showFilterModal: false }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      minPrice: '',
      maxPrice: '',
      selectedCategory: undefined,
      selectedSupplierType: '',
      sortBy: '',
    }));
  }, []);

  // Filter products
  const filteredProducts = useCallback(
    (products: Product[]): Product[] => {
      return products.filter((product) => {
        const matchesSearch = product?.name
          ?.toLowerCase()
          .includes(filterState.searchQuery.toLowerCase());
        const matchesCategory =
          !filterState.selectedCategory ||
          product?.category_id === filterState.selectedCategory.id;
        const matchesMinPrice =
          !filterState.minPrice || product.price >= parseFloat(filterState.minPrice);
        const matchesMaxPrice =
          !filterState.maxPrice || product.price <= parseFloat(filterState.maxPrice);
        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
      });
    },
    [
      filterState.searchQuery,
      filterState.selectedCategory,
      filterState.minPrice,
      filterState.maxPrice,
    ]
  );

  // Filter suppliers
  const filteredSuppliers = useCallback(
    (suppliers: Supplier[]): Supplier[] => {
      return suppliers.filter((supplier) => {
        const matchesSearch =
          supplier.business_name
            ?.toLowerCase()
            .includes(filterState.searchQuery?.toLowerCase()) ||
          supplier?.description
            ?.toLowerCase()
            .includes(filterState.searchQuery?.toLowerCase()) ||
          supplier.domain?.name
            ?.toLowerCase()
            .includes(filterState.searchQuery?.toLowerCase());
        const matchesType =
          filterState.selectedSupplierType === 'All' ||
          !filterState.selectedSupplierType ||
          supplier?.type?.toLowerCase() ===
            filterState.selectedSupplierType?.toLowerCase();
        return matchesSearch && matchesType;
      });
    },
    [filterState.searchQuery, filterState.selectedSupplierType]
  );

  // Sort products
  const sortedProducts = useCallback(
    (products: Product[]): Product[] => {
      return [...products].sort((a, b) => {
        switch (filterState.sortBy) {
          case 'Price: Low to High':
            return a.price - b.price;
          case 'Price: High to Low':
            return b.price - a.price;
          case 'Alphabetical':
            return a?.name?.localeCompare(b?.name);
          default:
            return 0;
        }
      });
    },
    [filterState.sortBy]
  );

  // Sort suppliers
  const sortedSuppliers = useCallback(
    (suppliers: Supplier[]): Supplier[] => {
      return [...suppliers].sort((a, b) => {
        switch (filterState.sortBy) {
          case 'Alphabetical':
            return a.business_name?.localeCompare(b.business_name);
          case 'Most Recent':
            return (
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          default:
            return 0;
        }
      });
    },
    [filterState.sortBy]
  );

  return {
    filterState,
    setSearchQuery,
    setMinPrice,
    setMaxPrice,
    setSelectedCategory,
    setSelectedSupplierType,
    setSortBy,
    setShowFilterModal,
    applyFilters,
    clearFilters,
    filteredProducts,
    filteredSuppliers,
    sortedProducts,
    sortedSuppliers,
  };
};