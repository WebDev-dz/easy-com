import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, Plus, Star, CreditCard as Edit, Trash2, ShoppingCart, MessageSquare } from 'lucide-react-native';
import { useDeleteProduct, useGetProductsBySupplier } from '@/hooks/product-hooks';
import { Product } from '@/services/types';
import ProductsGrid from '@/components/products-grid';
import { useGetSupplierReviews } from '@/hooks/reviews-hooks';
import { useSupplier } from '@/hooks/supplier-hooks';
import { useAuth } from '@/hooks/useAuth';

export default function StoreProductsScreen() {
  const { supplierId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: store, isPending: isStorePending } = useSupplier(Number(supplierId) || 0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { mutate: getSupplierReviews, data: reviewsData } = useGetSupplierReviews();
  const { mutate: getSupplierProducts, data: products = [], error, isPending } = useGetProductsBySupplier();
  const { user } = useAuth();

  const categories = ['all', 'Electronics', 'Accessories'];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        color="#F59E0B"
        fill={index < rating ? '#F59E0B' : 'none'}
      />
    ));
  };

  useEffect(() => {
    if (supplierId) {
      getSupplierProducts(Number(supplierId));
      getSupplierReviews(Number(supplierId));
    }
  }, [supplierId]);

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    router.push({
      pathname: '/product/add',
      params: { storeId: supplierId as string },
    });
  };

  const toggleFavorite = (favorites: Set<number>) => {
    setFavorites(favorites);
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{store?.business_name}</Text>
          {reviewsData && (
            <View style={styles.storeRating}>
              {renderStars(Math.round(reviewsData.data.average_rating))}
              <Text style={styles.ratingText}>{reviewsData.data.average_rating}</Text>
              <Text style={styles.reviewCount}>({reviewsData.data.review_count} reviews)</Text>
            </View>
          )}
        </View>
       {user?.id === Number(store?.user_id) && <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>}
      </View>

     

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <ScrollView refreshControl={
        <RefreshControl refreshing={isPending} onRefresh={() => getSupplierProducts(Number(supplierId))} />
      } horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar} contentContainerStyle={styles.categoriesContent}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category === 'all' ? 'All' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
        <ProductsGrid
          isPending={isPending}
          error={error}
          sortedProducts={filteredProducts}
          favorites={favorites}
          setFavorites={toggleFavorite}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoriesContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748B',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 65,
    flexGrow: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    padding: 0
  },
  categoriesBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  productsContainer: {
    flex: 1,
    padding: 24,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  productActions: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  reviewsScroll: {
    paddingLeft: 24,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});