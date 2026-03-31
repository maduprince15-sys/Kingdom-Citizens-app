import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImageResult {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

export const imageService = {
  // Request camera permissions
  async requestCameraPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  },

  // Request media library permissions
  async requestMediaLibraryPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  },

  // Pick an image from the library
  async pickImage(): Promise<ImageResult | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant photo library access to attach images.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          base64: asset.base64 || '',
          width: asset.width,
          height: asset.height,
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  },

  // Take a photo with the camera
  async takePhoto(): Promise<ImageResult | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant camera access to take photos.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          base64: asset.base64 || '',
          width: asset.width,
          height: asset.height,
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  },

  // Show action sheet for image selection
  showImagePickerOptions(onImageSelected: (image: ImageResult) => void) {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const image = await this.takePhoto();
            if (image) onImageSelected(image);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const image = await this.pickImage();
            if (image) onImageSelected(image);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  },
};
