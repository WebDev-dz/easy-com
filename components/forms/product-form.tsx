import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AlertCircle, Package } from 'lucide-react-native';
import { ImageUploader } from '@/components/image-uploader';
import { z } from 'zod';


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

// Zod schema for form validation
const productSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters')
    .nonempty('Product name is required'),
  price: z
    .string()
    .trim()
    .nonempty('Price is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0 && num <= 999999.99;
      },
      {
        message: 'Price must be a valid number between 0.01 and 999,999.99',
      }
    ),
  quantity: z
    .string()
    .trim()
    .nonempty('Quantity is required')
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0 && num <= 999999;
      },
      {
        message: 'Quantity must be a valid integer between 1 and 999,999',
      }
    ),
  minOrderQuantity: z
    .string()
    .trim()
    .optional()
    .default('1')
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num > 0;
      },
      {
        message: 'Minimum order quantity must be a valid integer greater than 0',
      }
    ),
  categoryId: z
    .number({ invalid_type_error: 'Please select a category' })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Please select a category',
    }),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .nonempty('Description is required'),
  images: z
    .array(z.any())
    .min(1, 'At least one product image is required'),
});

interface FormData {
  productName: string;
  price: string;
  quantity: string;
  minOrderQuantity: string;
  categoryId: number | null;
  description: string;
}

interface ProductFormProps {
  categoriesData: any; // Replace with proper type based on your API response
  isLoadingCategories: boolean;
  productImages: any[]; // Replace with proper type for images
  isUploading: boolean;
  imageErrors?: string | null;
  handleImageUpload: () => void;
  pickImageFromGallery: () => Promise<void>;
  captureImageFromCamera: () => Promise<void>;
  pickFileFromDevice: () => Promise<void>;
  clearImages: () => void;
  removeImage: (index: number) => void;
  onSubmit: (formData: FormData, productImages: any[]) => void; // Replace with proper type
  isSubmitting: boolean;
  initialData?: Partial<FormData>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  categoriesData,
  isLoadingCategories,
  productImages,
  isUploading,
  imageErrors,
  handleImageUpload,
  pickImageFromGallery,
  captureImageFromCamera,
  pickFileFromDevice,
  clearImages,
  removeImage,
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    productName: initialData?.productName || '',
    price: initialData?.price || '',
    quantity: initialData?.quantity || '',
    minOrderQuantity: initialData?.minOrderQuantity || '1',
    categoryId: initialData?.categoryId || null,
    description: initialData?.description || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    try {
      // Validate form data with Zod
      const validatedData = productSchema.parse({
        ...formData,
        images: productImages,
        // Ensure minOrderQuantity is validated against quantity
        minOrderQuantity: formData.minOrderQuantity || '1',
      });

      // Additional validation for minOrderQuantity vs quantity
      const minOrderNum = parseInt(formData.minOrderQuantity || '1', 10);
      const quantityNum = parseInt(formData.quantity, 10);
      if (!isNaN(quantityNum) && minOrderNum > quantityNum) {
        setErrors({
          minOrderQuantity: 'Minimum order quantity cannot exceed total quantity',
        });
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const updateFormData = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      onSubmit(formData, productImages);
    }
  };

  return (
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
              {categoriesData?.data.map((cat: any) => (
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
        errors={errors.images || imageErrors || null}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
        maxImages={5}
        pickImageFromGallery={pickImageFromGallery}
        captureImageFromCamera={captureImageFromCamera}
        pickFileFromDevice={pickFileFromDevice}
        clearImages={clearImages}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || isUploading || isLoadingCategories) && styles.submitButtonDisabled,
          ]}
          onPress={handleFormSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>{initialData ? 'Update Product' : 'Add Product'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ProductForm;