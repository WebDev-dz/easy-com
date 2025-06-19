import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface InputTextProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  isTextArea?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export function InputText({
  label,
  value,
  onChangeText,
  error,
  icon,
  isTextArea = false,
  maxLength,
  showCharacterCount = false,
  ...inputProps
}: InputTextProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWithIcon, icon && styles.inputWithIconContainer]}>
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            isTextArea && styles.textArea,
            error && styles.inputError,
            icon && styles.inputWithIconPadding,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9CA3AF"
          multiline={isTextArea}
          textAlignVertical={isTextArea ? 'top' : 'center'}
          maxLength={maxLength}
          {...inputProps}
        />
      </View>
      {showCharacterCount && maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

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
  inputWithIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});