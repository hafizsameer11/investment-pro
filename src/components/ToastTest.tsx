import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export const ToastTest = () => {
  const showErrorToast = () => {
    Toast.show({
      type: 'error',
      text1: 'Error Test',
      text2: 'This is a test error message',
      position: 'top',
      visibilityTime: 4000,
    });
  };

  const showSuccessToast = () => {
    Toast.show({
      type: 'success',
      text1: 'Success Test',
      text2: 'This is a test success message',
      position: 'top',
      visibilityTime: 4000,
    });
  };

  const showInfoToast = () => {
    Toast.show({
      type: 'info',
      text1: 'Info Test',
      text2: 'This is a test info message',
      position: 'top',
      visibilityTime: 4000,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={showErrorToast}>
        <Text style={styles.buttonText}>Test Error Toast</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.successButton]} onPress={showSuccessToast}>
        <Text style={styles.buttonText}>Test Success Toast</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={showInfoToast}>
        <Text style={styles.buttonText}>Test Info Toast</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
