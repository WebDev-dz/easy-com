import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import {
  ShoppingCart,
  Eye,
  Heart,
  Trash2,
} from 'lucide-react-native';
import { Product } from '@/services/types';
import { router } from 'expo-router';
import { useAddToCart } from '@/hooks/cart-hooks';
import { alertService } from '@/lib/alert';
import { API_URL } from '@/services/api';
import { useDeleteProduct, useGetProductsBySupplier } from '@/hooks/product-hooks';
import { dialogService } from './dialog';
import { useAuth } from '@/hooks/useAuth';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

type Props = {
    product: Product;
    favorites: Set<number>;
    isCurrentUser: boolean;
    setFavorites: (favorites: Set<number>) => void;
}

export const ProductCard = ({ product, favorites, setFavorites , isCurrentUser}: Props) => {
    const addToCartMutation = useAddToCart();
    const { data: deleteData, error: deleteError, isPending: isDeletePending, mutateAsync: deleteMutate } = useDeleteProduct();
    const { user } = useAuth();
    const {mutate: getProduct} = useGetProductsBySupplier();

    console.log({product})
    const toggleFavorite = (id: number) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
          newFavorites.delete(id);
        } else {
          newFavorites.add(id);
        }
        setFavorites(newFavorites);
    };

    const handleProductPress = (product: Product) => {
        router.push({
          pathname: '/product/details',
          params: { id: product.id },
        });
    };

    const handleAddToCartPress = () => {
        if (product.quantity <= 0) return;
        
        addToCartMutation.mutate(
            { product_id: product.id, quantity: 1 },
            {
                onSuccess: () => {
                    alertService('Added to Cart', 'Product has been added to your cart!', [
                        { text: 'Continue Shopping', style: 'default' },
                        { text: 'View Cart', onPress: () => router.push('/cart') },
                    ]);
                },
                onError: (error) => {
                    alertService('Error', error.message || 'Failed to add product to cart');
                }
            }
        );
    };

    const handleDeleteProduct = () => {
        dialogService.confirm({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product?',
            buttons: [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => {
                        deleteMutate(product.id).then(() => router.replace({pathname:'/store/products', 
                             params: { supplierId: product.supplier_id.toString() }
                        }));
                    },
                },
            ]
        });
    };

    return (
      <View key={product.id} style={styles.productCard}>
        <TouchableOpacity onPress={() => handleProductPress(product)}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  product.pictures.length > 0
                    ? `${API_URL.replace('/api', '')}/storage/${product.pictures[0].picture}`
                    : '',
              }}
              style={styles.productImage}
            />
            {/* {product. && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )} */}

            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(product.id)}
            >
              <Heart
                size={16}
                color={favorites.has(product.id) ? '#EF4444' : '#FFFFFF'}
                fill={favorites.has(product.id) ? '#EF4444' : 'none'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product?.name}
            </Text>
            
            <View style={styles.ratingContainer}>
              {/* {renderStars(product.rating)} */}
              {/* <Text style={styles.ratingText}>({product.reviewCount})</Text> */}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>DA {product.price}</Text>
            </View>
            {product.quantity <= 0 && (
              <Text style={styles.outOfStock}>Out of Stock</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleProductPress(product)}
          >
            <Eye size={16} color="#6B7280" />
            {/* <Text style={styles.viewButtonText}>View</Text> */}
          </TouchableOpacity>
          {isCurrentUser ? (
            <TouchableOpacity
              style={[styles.deleteButton]}
              onPress={handleDeleteProduct}
            >
              <Trash2 size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.cartButton,
                product.quantity <= 0 && styles.disabledButton,
              ]}
              onPress={handleAddToCartPress}
              disabled={product.quantity <= 0}
            >
              <ShoppingCart size={16} color="#FFFFFF" />
              {/* <Text style={styles.cartButtonText}>
                {(product.quantity > 0) ? 'Add to Cart' : 'Unavailable'}
              </Text> */}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };


const styles = StyleSheet.create({
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        flex: 1,
        maxWidth: '100%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      imageContainer: {
        position: 'relative',
      },
      productImage: {
        width: '100%',
        height: 130,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
      productInfo: {
        padding: 12,
      },
      productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
      },
      productSupplier: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
      },productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
      },
      priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
      
      originalPrice: {
        fontSize: 14,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
      },
      discountedPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
      },
      outOfStock: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
        marginTop: 4,
      },
      productActions: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 0,
        gap: 8,
      },
      viewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingVertical: 8,
        gap: 4,
      },
      viewButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
      },
      cartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
        paddingVertical: 8,
        gap: 4,
      },
      deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        borderRadius: 8,
        paddingVertical: 8,
        gap: 4,
      },
      cartButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#FFFFFF',
      },
      disabledButton: {
        backgroundColor: '#D1D5DB',
      },
      favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 16,
        padding: 6,
      },
      
      
      ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
      },
      ratingText: {
        fontSize: 12,
        color: '#6B7280',
      },
})