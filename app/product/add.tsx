import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react-native';
import { useCreateProduct } from '@/hooks/product-hooks';
import { useCategories } from '@/hooks/category-hooks';
import { alertService } from '@/lib/alert';
import { useAuth } from '@/hooks/useAuth';
import { CreateProductRequest } from '@/services/types';
import { useImageUploader } from '@/hooks/image-uploader';
import { ImageUploader } from '@/components/image-uploader';

// Type definitions
export interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  minOrderQuantity?: string;
  category?: string;
  description?: string;
  images?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export default function AddProductScreen() {
  const { user } = useAuth();
  const { storeId } = useLocalSearchParams();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const { mutate: createProduct, error, isPending: isLoading } = useCreateProduct();

  // Image uploader hook
  const {
    productImages,
    isUploading,
    errors: imageErrors,
    handleImageUpload,
    pickImageFromGallery,
    captureImageFromCamera,
    pickFileFromDevice,
    clearImages,
    removeImage,
  } = useImageUploader({
    maxImages: 5,
    maxImageSize: 5 * 1024 * 1024, // 5MB
  });

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    quantity: '',
    minOrderQuantity: '1',
    categoryId: null as number | null,
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Validation function
  const validateForm = useCallback((): ValidationResult => {
    const newErrors: FormErrors = {};
    console.log({ formData });
    // Name validation
    if (!formData.productName.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.productName.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    } else if (formData.productName.trim().length > 100) {
      newErrors.name = 'Product name must be less than 100 characters';
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Please enter a valid price greater than 0';
      } else if (priceNum > 999999.99) {
        newErrors.price = 'Price cannot exceed DA 999,999.99';
      }
    }

    // Quantity validation
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const quantityNum = parseInt(formData.quantity, 10);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        newErrors.quantity = 'Please enter a valid quantity greater than 0';
      } else if (quantityNum > 999999) {
        newErrors.quantity = 'Quantity cannot exceed 999,999';
      }
    }

    // Minimum order quantity validation
    if (formData.minOrderQuantity.trim()) {
      const minOrderNum = parseInt(formData.minOrderQuantity, 10);
      const quantityNum = parseInt(formData.quantity, 10);
      if (isNaN(minOrderNum) || minOrderNum <= 0) {
        newErrors.minOrderQuantity = 'Please enter a valid minimum order quantity';
      } else if (!isNaN(quantityNum) && minOrderNum > quantityNum) {
        newErrors.minOrderQuantity = 'Minimum order quantity cannot exceed total quantity';
      }
    }

    // Category validation
    if (!formData.categoryId) {
      newErrors.category = 'Please select a category';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Image validation
    if (productImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }, [formData, productImages]);

  // Update form data
  const updateFormData = (field: keyof typeof formData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const supplierId = storeId;
    try {
      // Validate form
      const validation = validateForm();
      setErrors(validation.errors);

      if (!validation.isValid) {
        alertService('Validation Error', 'Please fix the errors and try again.');
        return;
      }

      // Validate store ID
      if (!supplierId || isNaN(Number(supplierId))) {
        alertService('Error', 'Invalid store ID. Please try again.');
        return;
      }

      // Prepare product data
      const productData: CreateProductRequest = {
        supplier_id: Number(supplierId),
        name: formData.productName.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        minimum_quantity: parseInt(formData.minOrderQuantity || '1', 10),
        description: formData.description.trim(),
        category_id: formData.categoryId!,
        visibility: 'public',
        pictures: productImages, // Use the first File object
      };

      await createProduct(productData);

      // Clear form after successful submission
      setFormData({
        productName: '',
        price: '',
        quantity: '',
        minOrderQuantity: '1',
        categoryId: null,
        description: '',
      });
      setErrors({});
      router.back();
    } catch (error: any) {
      console.error('Submit error:', error);
      let errorMessage = 'Failed to add product. Please try again.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alertService('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter product name"
              value={formData.productName}
              onChangeText={(value) => updateFormData('productName', value)}
              placeholderTextColor="#9CA3AF"
              maxLength={100}
            />
            {errors.name && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errors.name}</Text>
              </View>
            )}
          </View>

          {/* Price and Quantity Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.inputWithIcon}>
                <Text style={styles.inputIcon}>DA</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIconPadding,
                    errors.price && styles.inputError,
                  ]}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(value) => updateFormData('price', value)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.price && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.price}</Text>
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Quantity *</Text>
              <View style={styles.inputWithIcon}>
                <Package size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIconPadding,
                    errors.quantity && styles.inputError,
                  ]}
                  placeholder="0"
                  value={formData.quantity}
                  onChangeText={(value) => updateFormData('quantity', value)}
                  keyboardType="number-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.quantity && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Minimum Order Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Order Quantity</Text>
            <TextInput
              style={[styles.input, errors.minOrderQuantity && styles.inputError]}
              placeholder="1"
              value={formData.minOrderQuantity}
              onChangeText={(value) => updateFormData('minOrderQuantity', value)}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
            {errors.minOrderQuantity && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errors.minOrderQuantity}</Text>
              </View>
            )}
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              {isLoadingCategories ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}
                >
                  {categoriesData?.data.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerItem,
                        formData.categoryId === cat.id && styles.pickerItemSelected,
                        errors.category && styles.pickerItemError,
                      ]}
                      onPress={() => updateFormData('categoryId', cat.id)}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          formData.categoryId === cat.id && styles.pickerTextSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            {errors.category && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errors.category}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your product in detail"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {formData.description.length}/1000
            </Text>
            {errors.description && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>{errors.description}</Text>
              </View>
            )}
          </View>

          {/* Image Uploader */}
          <ImageUploader
            productImages={productImages}
            isUploading={isUploading}
            errors={errors.images || imageErrors}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            maxImages={5} 
            pickImageFromGallery={pickImageFromGallery}
            captureImageFromCamera={captureImageFromCamera}
            pickFileFromDevice={pickFileFromDevice} 
            clearImages={clearImages}          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || isUploading || isLoadingCategories) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          // disabled={isLoading || isUploading || isLoadingCategories}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Add Product</Text>
          )}
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 12,
    zIndex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  inputWithIconPadding: {
    paddingLeft: 48,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
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
  pickerItemError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  pickerTextSelected: {
    color: '#FFFFFF',
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