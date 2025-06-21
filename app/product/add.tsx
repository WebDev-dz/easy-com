import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCreateProduct } from '@/hooks/product-hooks';
import { useCategories } from '@/hooks/category-hooks';
import { alertService } from '@/lib/alert';
import { useAuth } from '@/hooks/useAuth';
import { CreateProductRequest } from '@/services/types';
import { useImageUploader } from '@/hooks/image-uploader';
import ProductForm from '@/components/forms/product-form';

export default function AddProductScreen() {
  const { storeId } = useLocalSearchParams();
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const { mutateAsync: createProduct, isPending: isLoading } = useCreateProduct();

  // Image uploader hook
  const imageUploader = useImageUploader({
    maxImages: 5,
    maxImageSize: 5 * 1024 * 1024, // 5MB
  });

  // Handle form submission
  const handleSubmit = async (formData: any, productImages: any) => {
    const supplierId = storeId;
    try {
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
        pictures: productImages,
      };

      await createProduct(productData);
      
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
        <ProductForm
          categoriesData={categoriesData}
          isLoadingCategories={isLoadingCategories}
          productImages={imageUploader.productImages}
          isUploading={imageUploader.isUploading}
          imageErrors={imageUploader.errors}
          handleImageUpload={imageUploader.handleImageUpload}
          pickImageFromGallery={imageUploader.pickImageFromGallery}
          captureImageFromCamera={imageUploader.captureImageFromCamera}
          pickFileFromDevice={imageUploader.pickFileFromDevice}
          clearImages={imageUploader.clearImages}
          removeImage={imageUploader.removeImage}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
        />
      </ScrollView>
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
});