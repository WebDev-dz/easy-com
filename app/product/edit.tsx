import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Upload, DollarSign, Package, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGetProduct, useUpdateProduct } from '@/hooks/product-hooks';
import { useCategories } from '@/hooks/category-hooks';
import { alertService } from '@/lib/alert';
import { Product, Category } from '@/services/types';
import { API_URL } from '@/services/api';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [category, setCategory] = useState<Category>();
  const [description, setDescription] = useState('');
  const [productImage, setProductImage] = useState('');
  const [file, setFile] = useState<File>();
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  const { mutate: getProduct, data: product, isPending: isLoading } = useGetProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (id) {
      getProduct(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setPrice(product.price.toString());
      setQuantity(product.quantity.toString());
      setMinOrderQuantity(product.minimum_quantity.toString());
      setDescription(product.description || '');
      setCategory(product.category_id ? categories?.data.find(c => c.id === product.category_id) : undefined);
      if (product.pictures.length > 0) {
        setProductImage(product.pictures[0].picture);
      }
    }
  }, [product, categories]);

  // Request permissions for mobile
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alertService(
        'Permissions Required',
        'Please grant camera and photo library permissions to upload images.'
      );
      return false;
    }
    return true;
  };

  // Mobile image picker functions
  const pickImageFromCamera = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFile(result.assets[0].file);
        setProductImage(result.assets[0].uri);
      }
    } catch (error) {
      alertService('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFile(result.assets[0].file);
        setProductImage(result.assets[0].uri);
      }
    } catch (error) {
      alertService('Error', 'Failed to select image');
      console.error('Gallery error:', error);
    }
  };

  // Web file input handler
  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alertService('Error', 'File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alertService('Error', 'Please select an image file');
      return;
    }
    setFile(file);
    setProductImage(URL.createObjectURL(file));
  };

  const handleImageUpload = () => {
    if (Platform.OS === 'web') {
      // For web, trigger file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = handleWebFileSelect as any;
      input.click();
    } else {
      // For mobile, show action sheet
      alertService(
        'Select Image',
        'Choose how you want to update the product image',
        [
          { text: 'Camera', onPress: pickImageFromCamera },
          { text: 'Gallery', onPress: pickImageFromGallery },
          { text: 'Remove Image', onPress: () => {
            if (product?.pictures[0]) {
              setImagesToDelete([...imagesToDelete, product.pictures[0].id]);
            }
            setProductImage('');
            setFile(undefined);
          }, style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    if (!productName || !price || !quantity || !category || !description) {
      alertService('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      alertService('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      alertService('Error', 'Please enter a valid quantity');
      return;
    }

    if (isNaN(Number(minOrderQuantity)) || Number(minOrderQuantity) <= 0) {
      alertService('Error', 'Please enter a valid minimum order quantity');
      return;
    }

    updateProduct({
      id: Number(id),
      data: {
        name: productName,
        price: Number(price),
        quantity: Number(quantity),
        minimum_quantity: Number(minOrderQuantity),
        description,
        category_id: category.id,
        pictures: file ? [file] : undefined,
        images_to_delete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
      }
    }, {
      onSuccess: () => {
        alertService('Success', 'Product updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (error) => {
        alertService('Error', error.message || 'Failed to update product. Please try again.');
      }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.inputWithIcon}>
                <DollarSign size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Quantity *</Text>
              <View style={styles.inputWithIcon}>
                <Package size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  placeholder="0"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Order Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={minOrderQuantity}
              onChangeText={setMinOrderQuantity}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {categories?.data.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pickerItem,
                      category?.id === cat.id && styles.pickerItemSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        category?.id === cat.id && styles.pickerTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImageUpload}>
              {productImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: `${API_URL.replace('/api', '')}/storage/${productImage}` }} style={styles.uploadedImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => {
                      if (product?.pictures[0]) {
                        setImagesToDelete([...imagesToDelete, product.pictures[0].id]);
                      }
                      setProductImage('');
                      setFile(undefined);
                    }}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUploadContent}>
                  <Upload size={32} color="#9CA3AF" />
                  <Text style={styles.imageUploadText}>Upload Product Image</Text>
                  <Text style={styles.imageUploadSubtext}>JPG, PNG up to 5MB</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isUpdating && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isUpdating}
        >
          <Text style={styles.submitButtonText}>
            {isUpdating ? 'Updating Product...' : 'Update Product'}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 1,
  },
  inputWithIconPadding: {
    paddingLeft: 48,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    marginTop: 8,
  },
  pickerScrollContent: {
    paddingRight: 24,
  },
  pickerItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  pickerItemSelected: {
    backgroundColor: '#8B5CF6',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  pickerTextSelected: {
    color: '#FFFFFF',
  },
  imageUploadContainer: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadContent: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});