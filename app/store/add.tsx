// First, install required dependencies:
// npm install expo-image-picker expo-file-system react-native-image-picker

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCreateSupplier } from '@/hooks/supplier-hooks';
import { useAuth } from '@/hooks/useAuth';
import { useDomains } from '@/hooks/domain-hooks';
import { Category, Domain } from '@/services/types';
import { useCategories } from '@/hooks/category-hooks';
import { alertService } from '@/lib/alert';
import { useImageUploader } from '@/hooks/image-uploader';
import { ImageUploader } from '@/components/image-uploader';

export default function AddStoreScreen() {
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [storeCategory, setStoreCategory] = useState<Category>();
  const [address, setAddress] = useState('');
  const [domain, setDomain] = useState<Domain>();
  const [description, setDescription] = useState('');
  
  const { data: store, mutate: createStore, error, isPending: isLoading } = useCreateSupplier();
  const { data: domains } = useDomains();
  const { data: storeCategories } = useCategories();
  const { user } = useAuth();

  // Use the image uploader hook
  const imageUploader = useImageUploader({
    maxImages: 1, // Only allow 1 image for store
    maxImageSize: 2 * 1024 * 1024, // 2MB
  });

  const storeTypes = [
    'Workshop',
    'Importer',
    'Shop',
    'In Creation',
  ];

  const handleSubmit = async () => {
    if (!storeName || !storeType || !storeCategory || !domain || !description) {
      alertService('Error', 'Please fill in all required fields');
      return;
    }
    
    if (user) {
      
      
      createStore({
        user_id: user.id,
        business_name: storeName,
        description: description,
        address: address,
        domain_id: domain.id,
        type: 'workshop',
        // @ts-ignore
        picture: imageUploader.productImages?.at(0), // Use the first image file
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Store</Text>
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
            <Text style={styles.label}>Store Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter store address"
              value={address}
              onChangeText={setAddress}
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

          {/* Use the reusable ImageUploader component */}
          <ImageUploader
            {...imageUploader}
            maxImages={1}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Creating Store...' : 'Create Store'}
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