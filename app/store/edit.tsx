import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSupplier, useUpdateSupplier } from '@/hooks/supplier-hooks';
import { useAuth } from '@/hooks/useAuth';
import { useDomains } from '@/hooks/domain-hooks';
import { Category, Domain } from '@/services/types';
import { useCategories } from '@/hooks/category-hooks';
import { alertService } from '@/lib/alert';

export default function EditStoreScreen() {
  const params = useLocalSearchParams();
  const [storeName, setStoreName] = useState(params.storeName as string || '');
  const [storeType, setStoreType] = useState(params.storeType as string || '');
  const [storeCategory, setStoreCategory] = useState<Category>();
  const [domain, setDomain] = useState<Domain>();
  const [description, setDescription] = useState(params.storeDescription as string || '');
  const [storeImage, setStoreImage] = useState(params.storeImage as string || '');
  const [file, setFile] = useState<File>();
  
  const { mutate: updateStore, isPending: isLoading } = useUpdateSupplier();
  const { data: domains } = useDomains();
  const { data: storeCategories } = useCategories();
  const { user } = useAuth();
  const { data: store } = useSupplier(Number(params.storeId));

  useEffect(() => {
    if (store) {
      setStoreName(store.business_name);
      setStoreType(store.type);
      setStoreCategory(store.domain);
      setDomain(store.domain);
      setDescription(store.description);
      setStoreImage(store.picture || '');
    }
  }, [store]);

  const storeTypes = [
    'Workshop',
    'Importer',
    'Shop',
    'In Creation',
  ];

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
        await setFile(result.assets[0].file);
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
        'Choose how you want to update the store image',
        [
          { text: 'Camera', onPress: pickImageFromCamera },
          { text: 'Gallery', onPress: pickImageFromGallery },
          { text: 'Remove Image', onPress: () => setStoreImage(''), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    if (!storeName || !storeType || !domain || !description) {
      alertService('Error', 'Please fill in all required fields');
      return;
    }

    const storeId = parseInt(params.storeId as string);
    if (!storeId) {
      alertService('Error', 'Invalid store ID');
      return;
    }

    updateStore({
      id: storeId,
      data: {
        business_name: storeName,
        description: description,
        address: '', // Add address field if needed
        domain_id: domain.id,
        type: storeType.toLowerCase() as 'workshop' | 'importer' | 'merchant',
        picture: file,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Store</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter store name"
              value={storeName}
              onChangeText={setStoreName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Type *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {storeTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerItem,
                      storeType === type && styles.pickerItemSelected,
                    ]}
                    onPress={() => setStoreType(type)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        storeType === type && styles.pickerTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {storeCategories?.data.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.pickerItem,
                      storeCategory === category && styles.pickerItemSelected,
                    ]}
                    onPress={() => setStoreCategory(category)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        storeCategory?.id === category.id && styles.pickerTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Domain *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerScrollContent}
              >
                {domains?.data.map((domainOption) => (
                  <TouchableOpacity
                    key={domainOption.id}
                    style={[
                      styles.pickerItem,
                      domain === domainOption && styles.pickerItemSelected,
                    ]}
                    onPress={() => setDomain(domainOption)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        domain === domainOption && styles.pickerTextSelected,
                      ]}
                    >
                      {domainOption.name}
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
              placeholder="Describe your store and what you sell"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Image</Text>
            <TouchableOpacity
              style={styles.imageUploadContainer}
              onPress={handleImageUpload}
            >
              {storeImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: storeImage }} style={styles.uploadedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setStoreImage('')}>
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUploadContent}>
                  <Upload size={32} color="#9CA3AF" />
                  <Text style={styles.imageUploadText}>Upload Store Image</Text>
                  <Text style={styles.imageUploadSubtext}>JPG, PNG up to 5MB</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Updating Store...' : 'Update Store'}
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