import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Category } from '@/services/types'; // Adjust path as needed
import { UseFiltersResult } from '@/hooks/filters-hook'; // Adjust path as needed

interface FiltersModalProps extends UseFiltersResult {
  categories?: Category[]; // Optional categories for product filtering
  selectedTab: 'products' | 'suppliers'; // Current tab to determine filter options
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  filterState,
  setMinPrice,
  setMaxPrice,
  setSelectedCategory,
  setSelectedSupplierType,
  setSortBy,
  setShowFilterModal,
  applyFilters,
  clearFilters,
  categories,
  selectedTab,
}) => {
  const { minPrice, maxPrice, selectedCategory, selectedSupplierType, sortBy, showFilterModal } = filterState;

  // Default supplier types and sort options from useFilters config
  const supplierTypes = ['All', 'Workshop', 'Importer', 'Merchant'];
  const sortOptions = [
    'Most Recent',
    'Popularity',
    'Price: Low to High',
    'Price: High to Low',
    'Alphabetical',
  ];

  return (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter {selectedTab}</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {selectedTab === 'products' && (
              <>
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Price Range</Text>
                  <View style={styles.priceRow}>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                    <Text style={styles.priceSeparator}>-</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {categories && categories.length > 0 && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.categoryRow}>
                        {categories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryChip,
                              selectedCategory?.id === category.id &&
                                styles.selectedCategoryChip,
                            ]}
                            onPress={() =>
                              setSelectedCategory(
                                selectedCategory?.id === category.id ? undefined : category
                              )
                            }
                          >
                            <Text
                              style={[
                                styles.categoryChipText,
                                selectedCategory?.id === category.id &&
                                  styles.selectedCategoryChipText,
                              ]}
                            >
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            {selectedTab === 'suppliers' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Supplier Type</Text>
                <View style={styles.supplierTypeGrid}>
                  {supplierTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.supplierTypeChip,
                        selectedSupplierType === type && styles.selectedSupplierTypeChip,
                      ]}
                      onPress={() =>
                        setSelectedSupplierType(selectedSupplierType === type ? '' : type)
                      }
                    >
                      <Text
                        style={[
                          styles.supplierTypeChipText,
                          selectedSupplierType === type && styles.selectedSupplierTypeChipText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortOption,
                      sortBy === option && styles.selectedSortOption,
                    ]}
                    onPress={() => setSortBy(sortBy === option ? '' : option)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option && styles.selectedSortOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 20,
    color: '#6B7280',
    padding: 4,
    fontWeight: '500',
  },
  filterContent: {
    padding: 24,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCategoryChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  supplierTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  supplierTypeChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: '22%',
    alignItems: 'center',
  },
  selectedSupplierTypeChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  supplierTypeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedSupplierTypeChipText: {
    color: '#FFFFFF',
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSortOption: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedSortOptionText: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});