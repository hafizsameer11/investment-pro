import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Card, SectionTitle, Button } from '../components/UI';
import { kycService } from '../services/kycService';
import Toast from 'react-native-toast-message';

interface KycDocument {
  id: number;
  document_type: string;
  original_filename: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

const documentTypes = [
  { key: 'passport', label: 'Passport', icon: 'passport' },
  { key: 'national_id', label: 'National ID', icon: 'card' },
  { key: 'drivers_license', label: 'Driver\'s License', icon: 'car' },
  { key: 'utility_bill', label: 'Utility Bill', icon: 'document-text' },
  { key: 'bank_statement', label: 'Bank Statement', icon: 'business' },
];

export default function KycUploadScreen() {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const userDocuments = await kycService.getUserDocuments();
      setDocuments(userDocuments);
    } catch (error) {
      console.log('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleUpload = async (documentType: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file) {
        return;
      }

      // Check file size (10MB limit)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
        return;
      }

      setIsUploading(true);

      // Create a file object for FormData
      const fileObj = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      };

      const uploadedDoc = await kycService.uploadDocument(documentType, fileObj);
      
      if (uploadedDoc) {
        await loadDocuments(); // Refresh the list
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Review';
      default:
        return 'Unknown';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.key === type);
    return docType ? docType.label : type;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading KYC documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.subtitle}>Upload your identity documents for verification</Text>
        </View>

        {/* Upload Section */}
        <Card>
          <SectionTitle 
            title="Upload Documents" 
            subtitle="Select document type and upload your verification documents"
          />
          
          <View style={styles.uploadGrid}>
            {documentTypes?.map((docType) => (
              <TouchableOpacity
                key={docType.key}
                style={styles.uploadItem}
                onPress={() => handleUpload(docType.key)}
                disabled={isUploading}
              >
                <View style={styles.uploadIcon}>
                  <Ionicons name={docType.icon as any} size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.uploadLabel}>{docType.label}</Text>
                {isUploading && (
                  <View style={styles.uploadingOverlay}>
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Uploaded Documents */}
        <Card>
          <SectionTitle 
            title="Your Documents" 
            subtitle="Track the status of your uploaded documents"
          />
          
          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Upload your identity documents to start the verification process
              </Text>
            </View>
          ) : (
            <View style={styles.documentsList}>
              {documents?.map((doc) => (
                <View key={doc.id} style={styles.documentItem}>
                  <View style={styles.documentInfo}>
                    <View style={styles.documentHeader}>
                      <Text style={styles.documentType}>
                        {getDocumentTypeLabel(doc.document_type)}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>
                          {getStatusText(doc.status)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.documentName}>{doc.original_filename}</Text>
                    <Text style={styles.documentDate}>
                      Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                    </Text>
                    {doc.admin_notes && (
                      <Text style={styles.adminNotes}>
                        Admin Notes: {doc.admin_notes}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Information */}
        <Card>
          <SectionTitle 
            title="Important Information" 
            subtitle="Please read before uploading documents"
          />
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                Supported formats: JPG, PNG, PDF (max 10MB)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                Documents must be clear and legible
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                Processing time: 1-3 business days
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.infoText}>
                You'll be notified once verification is complete
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  uploadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  uploadItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadingText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  documentsList: {
    gap: 12,
  },
  documentItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  documentInfo: {
    flex: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  documentName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  adminNotes: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
