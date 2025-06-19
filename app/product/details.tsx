import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShoppingCart, Store, Star, Heart, User } from 'lucide-react-native';
import { useGetProduct } from '@/hooks/product-hooks';
import { alertService } from '@/lib/alert';
import { Product, ProductWithSupplier } from '@/services/types';
import { useCategory } from '@/hooks/category-hooks';
import { useAddToCart } from '@/hooks/cart-hooks';
import { API_URL } from '@/services/api';

const { width } = Dimensions.get('window');



export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { data: category, mutate: getCategory } = useCategory();
  const addToCartMutation = useAddToCart();

  const getProduct = useGetProduct();

  useEffect(() => {
    if (id) {
      getProduct.mutate(Number(id));
    }
  }, [id]);

  useEffect(() => {
    const categoryId = getProduct.data?.category_id;
    if (!categoryId) return;
    getCategory(categoryId);
  }, [getProduct.data]);
    

  const handleAddToCartPress = () => {
    if (product.quantity <= 0) return;
    
    addToCartMutation.mutate(
        { product_id: product.id, quantity: 1 },
        {
            onSuccess: () => {
              router.push({
                pathname: '/checkout',
                params: { productId: getProduct?.data?.id! },
              });
                
            },
            onError: (error) => {
                alertService('Error', error.message || 'Failed to add product to cart');
            }
        }
    );
};

  const handleBuyNow = () => {
    if (!getProduct.data) return;
    handleAddToCartPress();
    
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        color="#F59E0B"
        fill={index < rating ? "#F59E0B" : "none"}
      />
    ));
  };

  if (getProduct.isPending) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  if (getProduct.isError) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load product details</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => getProduct.mutate(Number(id))}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const product = getProduct.data as ProductWithSupplier;
  if (!product) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Product Details</Text>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Heart size={24} color={isFavorite ? "#EF4444" : "#64748B"} fill={isFavorite ? "#EF4444" : "none"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.pictures.map((picture, index: number) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: `${API_URL.replace('/api', '')}/storage/${picture.picture}` }} style={styles.productImage} />
              </View>
            ))}
          </ScrollView>
          
          {/* Image indicators */}
          <View style={styles.imageIndicators}>
            {product.pictures.map((_, index: number) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Thumbnail strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailStrip}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {product.pictures.map((picture, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                selectedImageIndex === index && styles.activeThumbnail,
              ]}
              onPress={() => setSelectedImageIndex(index)}
            >
              <Image source={{ uri: `${API_URL.replace('/api', '')}/storage/${picture.picture}` }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.productInfo}>
          <View style={styles.storeInfo}>
            <Store size={16} color="#8B5CF6" />
            <Text style={styles.storeName}>{product.supplier?.business_name || 'Unknown Store'}</Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.category}>{category?.data.name ? 'Category ID: ' + product.category_id : 'Uncategorized'}</Text>

          <View style={styles.ratingContainer}>
            <View style={[styles.stockStatus, product.quantity > 0 ? styles.inStock : styles.outOfStock]}>
              <Text style={[styles.stockText, product.quantity > 0 ? styles.inStockText : styles.outOfStockText]}>
                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>DA {product.price}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description || 'No description available.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Minimum Order:</Text>
              <Text style={styles.specValue}>{product.minimum_quantity} units</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Available Quantity:</Text>
              <Text style={styles.specValue}>{product.quantity} units</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.buyButton, product.quantity <= 0 && styles.buyButtonDisabled]}
          onPress={handleBuyNow}
          disabled={product.quantity <= 0}
        >
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.buyButtonText}>
            {product.quantity > 0 ? 'Buy Now' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  favoriteButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  thumbnailStrip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  thumbnailContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: '#8B5CF6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: 8,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  storeRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  storeReviewCount: {
    fontSize: 14,
    color: '#64748B',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
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
  stockStatus: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inStock: {
    backgroundColor: '#D1FAE5',
  },
  outOfStock: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inStockText: {
    color: '#065F46',
  },
  outOfStockText: {
    color: '#991B1B',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 18,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
  featureText: {
    fontSize: 16,
    color: '#475569',
    flex: 1,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  specValue: {
    fontSize: 14,
    color: '#1E293B',
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
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
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});