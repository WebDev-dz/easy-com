import { useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { alertService } from "@/lib/alert";
import * as FileSystem from 'expo-file-system';
import { ImagePickerAsset } from "expo-image-picker";

/**
 * Converts a local file URI to a `File` object.
 * 
 * @param uri The local URI of the asset
 * @param name The desired file name (e.g., "image.jpg")
 * @param type The MIME type of the file (e.g., "image/jpeg")
 * @returns A `File` object compatible with uploads
 */
export async function createFileFromUri(
  uri: string,
  name: string,
  type: string
): Promise<File> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error(`File does not exist at ${uri}`);
  }

  const fileBlob = await fetch(uri).then(res => res.blob());

  return new File([fileBlob], name, { type });
}

// Types
export interface ProductImage {
  uri: string;
  type: "image/jpeg" | "image/png" | "image/jpg";
  name: string;
  size?: number;
  file?: File; // For web only
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UseImageUploaderProps {
  maxImages?: number;
  maxImageSize?: number;
  allowedImageExtensions?: string[];
  allowedImageTypes?: string[];
  allowedImageMimeTypes?: string[];
}

export interface UseImageUploaderResult {
  productImages: File[] | ImagePickerAsset[];
  isUploading: boolean;
  errors: string | null;
  pickImageFromGallery: () => Promise<void>;
  captureImageFromCamera: () => Promise<void>;
  pickFileFromDevice: () => Promise<void>;
  handleImageUpload: () => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

// Constants
const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];
const DEFAULT_ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export const extenstionToContentType = (extension: string) => {
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return "image/jpeg";
  }
};

// Cross-platform alert function
const showAlert = (
  title: string,
  message: string,
  options?: Array<{ text: string; onPress: () => void }>
) => {
  if (Platform.OS === "web") {
    if (options && options.length > 1) {
      // For web, use alertService if available, otherwise use confirm
      if (typeof alertService === "function") {
        alertService(title, message, options);
      } else {
        const confirmed = window.confirm(`${title}\n${message}`);
        if (confirmed && options[0]) {
          options[0].onPress();
        }
      }
    } else {
      if (typeof alertService === "function") {
        alertService(title, message);
      } else {
        window.alert(`${title}\n${message}`);
      }
    }
  } else {
    // Native Alert
    if (options && options.length > 1) {
      Alert.alert(
        title,
        message,
        options.map((option) => ({
          text: option.text,
          onPress: option.onPress,
        }))
      );
    } else {
      Alert.alert(title, message);
    }
  }
};

// Request permissions for mobile
const requestPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showAlert(
          "Permission Required",
          "Please grant access to your photo library to upload images."
        );
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Permission error:", error);
    return false;
  }
};

// Process mobile assets (ImagePickerAsset[])
const processMobileAssets = async (
  assets: ImagePickerAsset[],
  currentImages: ImagePickerAsset[],
  maxImages: number,
  validateImage: (image: any) => ImageValidationResult
): Promise<ImagePickerAsset[]> => {
  const newMobileAssets: ImagePickerAsset[] = [];

  for (const asset of assets) {
    if (currentImages.length + newMobileAssets.length >= maxImages) {
      showAlert(
        "Limit Reached",
        `You can upload maximum ${maxImages} images`
      );
      break;
    }

    let fileSize = asset.fileSize;
    let name = asset.fileName || `image_${Date.now()}.jpg`;
    let extension = name.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = extenstionToContentType(extension);
    console.log({asset})
    const imageData = {
      uri: asset.uri,
      type: asset.mimeType || contentType,
      name: name,
      size: fileSize,
      };

      console.log("pickedImageFromGallery", imageData);

    const validationResult = validateImage(imageData);
    if (!validationResult.isValid) {
      showAlert("Invalid Image", validationResult.error!);
      continue;
    }

    newMobileAssets.push(asset);
  }

  return newMobileAssets;
};

// Process web files (File[])
const processWebFiles = async (
  assets: ImagePickerAsset[],
  currentImages: File[],
  maxImages: number,
  validateImage: (image: any) => ImageValidationResult
): Promise<File[]> => {
  const newWebFiles: File[] = [];

  for (const asset of assets) {
    if (currentImages.length + newWebFiles.length >= maxImages) {
      showAlert(
        "Limit Reached",
        `You can upload maximum ${maxImages} images`
      );
      break;
    }

    if (!asset.file) {
      console.warn("Web asset missing file property");
      continue;
    }

    let name = asset.fileName || `image_${Date.now()}.jpg`;
    let extension = name.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = extenstionToContentType(extension);

    const imageData = {
      uri: asset.uri,
      type: asset.mimeType || contentType,
      name: name,
      size: asset.fileSize,
    };

    const validationResult = validateImage(imageData);
    if (!validationResult.isValid) {
      showAlert("Invalid Image", validationResult.error!);
      continue;
    }

    newWebFiles.push(asset.file);
  }

  return newWebFiles;
};

// Custom hook
export const useImageUploader = ({
  maxImages = DEFAULT_MAX_IMAGES,
  maxImageSize = DEFAULT_MAX_IMAGE_SIZE,
  allowedImageExtensions = DEFAULT_ALLOWED_IMAGE_EXTENSIONS,
  allowedImageTypes = DEFAULT_ALLOWED_IMAGE_MIME_TYPES,
}: UseImageUploaderProps = {}): UseImageUploaderResult => {
  const [productImages, setProductImages] = useState<File[] | ImagePickerAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  // Validate image
  const validateImage = useCallback(
    (image: {
      name: string;
      uri: string;
      size?: number;
      type: string;
    }): ImageValidationResult => {
      if (image.size && image.size > maxImageSize) {
        return { isValid: false, error: "Image size must be less than 5MB" };
      }
      const imageExtension = image.name?.split(".").pop()?.toLowerCase();
      if (imageExtension && !allowedImageExtensions.includes(imageExtension)) {
        console.log("Not allowed extension", imageExtension);
        return {
          isValid: false,
          error: "Only JPEG and PNG images are allowed",
        };
      }
      const imageMimeType = image.type;
      console.log({allowedImageTypes})
      if (imageMimeType && !allowedImageTypes.includes(imageMimeType)) {
        console.log("Not allowed mime type", imageMimeType);
        return {
          isValid: false,
          error: "Only JPEG and PNG images are allowed",
        };
      }
      return { isValid: true };
    },
    [maxImageSize, allowedImageTypes]
  );

  const processImages = useCallback(
    async (assets: ImagePicker.ImagePickerAsset[]) => {
      setIsUploading(true);
      setErrors(null);

      try {
        let newImages: File[] | ImagePickerAsset[] = [];

        if (Platform.OS === "web") {
          // Process web files
          newImages = await processWebFiles(
            assets,
            productImages as File[],
            maxImages,
            validateImage
          );
        } else {
          // Process mobile assets
          newImages = await processMobileAssets(
            assets,
            productImages as ImagePickerAsset[],
            maxImages,
            validateImage
          );
        }

        if (newImages.length > 0) {
          setProductImages((prev) => {
            if (prev.length > 0) {
              if (prev[0] instanceof File) {
                return [...(prev as File[]), ...(newImages as File[])];
              } else {
                return [...(prev as ImagePickerAsset[]), ...(newImages as ImagePickerAsset[])];
              }
            } else {
              return newImages;
            }
          });
        }
      } catch (error) {
        console.error("Error processing images:", error);
        setErrors("Failed to process selected images");
        showAlert("Error", "Failed to process selected images");
      } finally {
        setIsUploading(false);
      }
    },
    [productImages, maxImages, validateImage]
  );

  // Handle image selection from gallery
  const pickImageFromGallery = useCallback(async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
        allowsEditing: false,
        // Mobile-specific options
        ...(Platform.OS !== "web" && {
          exif: false,
          base64: false,
        }),
      });

      if (!result.canceled && result.assets) {
        await processImages(result.assets);
      }
    } catch (error) {
      console.error("Gallery picker error:", error);
      setErrors("Failed to select images from gallery");
      showAlert(
        "Error",
        "Failed to select images from gallery. Please try again."
      );
    }
  }, [processImages]);

  // Handle image capture from camera
  const captureImageFromCamera = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          showAlert(
            "Permission Required",
            "Please grant camera access to take photos."
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.8,
        aspect: [1, 1],
        allowsEditing: true,
        // Mobile-specific options
        ...(Platform.OS !== "web" && {
          exif: false,
          base64: false,
        }),
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        if (productImages.length >= maxImages) {
          showAlert(
            "Limit Reached",
            `You can upload maximum ${maxImages} images`
          );
          return;
        }

        await processImages([result.assets[0]]);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setErrors("Failed to capture image");
      showAlert("Error", "Failed to capture image. Please try again.");
    }
  }, [productImages.length, maxImages, processImages]);

  // Handle file selection (primarily for web, but works on mobile too)
  const pickFileFromDevice = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: true,
        copyToCacheDirectory: Platform.OS !== "web", // Important for mobile
      });

      if (!result.canceled && result.assets) {
        let newImages: File[] | ImagePickerAsset[] = [];

        if (Platform.OS === "web") {
          // Process web files from DocumentPicker
          const webFiles: File[] = [];
          for (const asset of result.assets) {
            if (productImages.length + webFiles.length >= maxImages) {
              showAlert(
                "Limit Reached",
                `You can upload maximum ${maxImages} images`
              );
              break;
            }

            if (!asset.file) {
              console.warn("Document picker asset missing file property");
              continue;
            }

            let name = asset.name || `image_${Date.now()}.jpg`;
            let extension = name.split('.').pop()?.toLowerCase() || 'jpg';
            const contentType = extenstionToContentType(extension);

            const imageData = {
              uri: asset.uri,
              type: contentType,
              name: name,
              size: asset.size,
            };

            const validationResult = validateImage(imageData);
            if (!validationResult.isValid) {
              showAlert("Invalid Image", validationResult.error!);
              continue;
            }

            webFiles.push(asset.file);
          }
          newImages = webFiles;
        } else {
          // Process mobile assets from DocumentPicker
          const mobileAssets: ImagePickerAsset[] = [];
          for (const asset of result.assets) {
            if (productImages.length + mobileAssets.length >= maxImages) {
              showAlert(
                "Limit Reached",
                `You can upload maximum ${maxImages} images`
              );
              break;
            }

            let name = asset.name || `image_${Date.now()}.jpg`;
            let extension = name.split('.').pop()?.toLowerCase() || 'jpg';
            const contentType = extenstionToContentType(extension);

            const imageData = {
              uri: asset.uri,
              type: contentType,
              name: name,
              size: asset.size,
            };

            const validationResult = validateImage(imageData);
            if (!validationResult.isValid) {
              showAlert("Invalid Image", validationResult.error!);
              continue;
            }

            mobileAssets.push(asset as any);
          }
          newImages = mobileAssets;
        }

        if (newImages.length > 0) {
          setProductImages((prev) => {
            if (prev.length > 0) {
              if (prev[0] instanceof File) {
                return [...(prev as File[]), ...(newImages as File[])];
              } else {
                return [...(prev as ImagePickerAsset[]), ...(newImages as ImagePickerAsset[])];
              }
            } else {
              return newImages;
            }
          });
          setErrors(null);
        }
      }
    } catch (error) {
      console.error("File picker error:", error);
      setErrors("Failed to select files");
      showAlert("Error", "Failed to select files. Please try again.");
    }
  }, [productImages.length, maxImages, validateImage]);

  // Handle image upload options
  const handleImageUpload = useCallback(() => {
    if (Platform.OS === "web") {
      pickFileFromDevice();
      return;
    }

    // Mobile: Show action sheet-style options
    const options = [
      { text: "Camera", onPress: captureImageFromCamera },
      { text: "Gallery", onPress: pickImageFromGallery },
      { text: "Files", onPress: pickFileFromDevice },
      { text: "Cancel", onPress: () => {} },
    ];

    showAlert("Add Image", "Choose how you want to add an image", options);
  }, [captureImageFromCamera, pickImageFromGallery, pickFileFromDevice]);

  // Remove image
  const removeImage = useCallback((index: number) => {
    setProductImages((prev) => {
      if (prev.length === 0) return prev;
      if (prev[0] instanceof File) {
        return (prev as File[]).filter((_, i) => i !== index);
      } else {
        return (prev as ImagePickerAsset[]).filter((_, i) => i !== index);
      }
    });
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    setProductImages([]);
    setErrors(null);
  }, []);

  return {
    productImages,
    isUploading,
    errors,
    pickImageFromGallery,
    captureImageFromCamera,
    pickFileFromDevice,
    handleImageUpload,
    removeImage,
    clearImages,
  };
};