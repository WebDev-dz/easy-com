import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useGetProduct, useUpdateProduct } from '@/hooks/product-hooks';
import { useCategories } from '@/hooks/category-hooks';
import { alertService } from '@/lib/alert';
import { useImageUploader } from '@/hooks/image-uploader';
import ProductForm from '@/components/forms/product-form';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { data: product, isPending: isLoading, mutate: getProduct } = useGetProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  const imageUploader = useImageUploader({
    maxImages: 5,
    maxImageSize: 5 * 1024 * 1024, // 5MB
  });
  
  const handleSubmit = async (formData: any, productImages: any) => {
    try {
      await updateProduct({
        id: Number(id),
        data: {
          name: formData.productName,
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          minimum_quantity: Number(formData.minOrderQuantity),
          description: formData.description,
          category_id: formData.categoryId,
          pictures: productImages,
        },
      });
      router.back();
    } catch (error: any) {
      alertService('Error', error.message || 'Failed to update product');
    }
  };

  useEffect(() => {
    if (id) {
      getProduct(Number(id));
    }
  }, [id])

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  const initialData = product ? {
    productName: product.name,
    price: product.price.toString(),
    quantity: product.quantity.toString(),
    minOrderQuantity: product.minimum_quantity.toString(),
    categoryId: product.category_id,
    description: product.description || '',
  } : undefined;

 

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
        {product && (
          <ProductForm
            initialData={initialData}
            categoriesData={categories}
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
            isSubmitting={isUpdating}
          />
        )}
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
  centerContent: {
    flex: 1,
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
});