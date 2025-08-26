import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import Toast from 'react-native-toast-message';

export interface KycDocument {
  id: number;
  user_id: number;
  document_type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  file_path: string;
  original_filename: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KycResponse {
  success: boolean;
  message: string;
  data: KycDocument | KycDocument[];
}

// KYC Service
export const kycService = {
  // Upload KYC document
  async uploadDocument(documentType: string, file: any): Promise<KycDocument | null> {
    try {
      console.log('🔵 Uploading KYC document:', { documentType, fileName: file.name });
      
      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('document', file);
      
      console.log('🔵 FormData created:', {
        documentType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      const response = await apiService.post<KycResponse>(
        API_CONFIG.ENDPOINTS.KYC.UPLOAD, 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      console.log('🟢 KYC Upload Response:', response);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Document Uploaded',
          text2: 'Your KYC document has been uploaded successfully',
          position: 'top',
          visibilityTime: 3000,
        });
        return response.data.data as unknown as KycDocument;
      }
      
      return null;
    } catch (error) {
      console.log('🔴 KYC Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      return null;
    }
  },

  // Get user's KYC documents
  async getUserDocuments(): Promise<KycDocument[]> {
    try {
      console.log('🔵 Fetching user KYC documents');
      
      const response = await apiService.get<KycResponse>(API_CONFIG.ENDPOINTS.KYC.DOCUMENTS);
      
      console.log('🟢 KYC Documents Response:', response);
      
      if (response.success) {
        return response.data.data as unknown as KycDocument[];
      }
      
      return [];
    } catch (error) {
      console.log('🔴 KYC Documents Error:', error);
      return [];
    }
  },

  // Download KYC document
  async downloadDocument(documentId: number): Promise<string | null> {
    try {
      console.log('🔵 Downloading KYC document:', documentId);
      
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.KYC.DOWNLOAD}/${documentId}`);
      
      console.log('🟢 KYC Download Response:', response);
      
      if (response.success) {
        return (response.data as any).data as string;
      }
      
      return null;
    } catch (error) {
      console.log('🔴 KYC Download Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download Error',
        text2: 'Failed to download document',
        position: 'top',
        visibilityTime: 4000,
      });
      return null;
    }
  },
};
