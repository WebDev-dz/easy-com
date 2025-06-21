import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Upload, X, AlertCircle } from 'lucide-react-native';
import { ProductImage, UseImageUploaderResult } from '@/hooks/image-uploader';

interface ImageUploaderProps extends UseImageUploaderResult {
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  productImages,
  isUploading,
  errors,
  handleImageUpload,
  removeImage,
  maxImages = 5,
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        Product Images ({productImages.length}/{maxImages})
      </Text>
      
      {/* Display uploaded images */}
      {productImages.length > 0 && (
        <View style={styles.imagesGrid}>
          {/* @ts-ignore */}
          {productImages?.map((image: ProductImage, index: number) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Upload button */}
      {productImages.length < maxImages && (
        <TouchableOpacity
          style={[styles.imageUploadContainer, errors && styles.imageUploadError]}
          onPress={handleImageUpload}
          disabled={isUploading}
        >
          <View style={styles.imageUploadContent}>
            {isUploading ? (
              <ActivityIndicator size="large" color="#9CA3AF" />
            ) : (
              <Upload size={32} color="#9CA3AF" />
            )}
            <Text style={styles.imageUploadText}>
              {isUploading
                ? 'Processing images...'
                : productImages.length === 0
                  ? 'Upload Product Images'
                  : 'Add Another Image'}
            </Text>
            <Text style={styles.imageUploadSubtext}>
              JPG, PNG up to 5MB (Max {maxImages} images)
            </Text>
          </View>
        </TouchableOpacity>
      )}
      
      {errors && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{errors}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  },
  imageUploadError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
    textAlign: 'center',
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
});