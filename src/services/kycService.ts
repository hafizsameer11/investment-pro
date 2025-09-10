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
  success?: boolean;            // make optional
  status?: 'success' | 'error'; // make optional
  message?: string;
  data?: any;                   // can be object or array or nested { data }
}

// Helper to unwrap axios-like wrappers and your envelope shapes
function unwrapEnvelope<R = any>(raw: any): KycResponse {
  const maybeAxios = raw && typeof raw === 'object' && 'data' in raw && 'status' in raw && 'url' in raw;
  const env: any = maybeAxios ? raw.data : raw; // axios { data: envelope, ... } vs plain envelope
  return (env ?? {}) as KycResponse;
}
function isOk(env: KycResponse): boolean {
  return env.success === true || env.status === 'success';
}
function pickData(env: KycResponse) {
  // supports { data: [...] } or { data: { data: [...] } } or { data: { ...doc } }
  const d = env?.data as any;
  if (!d) return null;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return d; // single object (e.g., uploaded doc)
}

// KYC Service
export const kycService = {
  // Upload KYC document
  async uploadDocument(documentType: string, file: any): Promise<KycDocument | null> {
    try {
      console.log('🔵 Uploading KYC document:', { documentType, fileName: file?.name });

      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('document', file);

      console.log('🔵 FormData created:', {
        documentType,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size
      });

      // DO NOT set Content-Type manually
      const raw = await apiService.post<KycResponse>(API_CONFIG.ENDPOINTS.KYC.UPLOAD, formData);

      console.log('🟢 KYC Upload Raw:', raw);

      const env = unwrapEnvelope(raw);
      if (!isOk(env)) {
        const msg = env?.message || 'Upload failed';
        throw new Error(msg);
      }

      const data = pickData(env);
      // data can be the doc object directly
      const doc: KycDocument | null = data && !Array.isArray(data) ? (data as KycDocument) : null;

      if (doc?.id) {
        Toast.show({
          type: 'success',
          text1: 'Document Uploaded',
          text2: 'Your KYC document has been uploaded successfully',
          position: 'top',
          visibilityTime: 3000,
        });
        return doc;
      }

      console.log('🔶 Unexpected upload payload shape:', env);
      return null;
    } catch (error: any) {
      console.log('🔴 KYC Upload Error:', {
        status: error?.response?.status,
        data: error?.response?.data,
        msg: error?.message,
      });
      const errorMessage = error?.message || 'Failed to upload document';
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

      const raw = await apiService.get<KycResponse>(API_CONFIG.ENDPOINTS.KYC.DOCUMENTS);
      console.log('✅ API Response (raw):', raw);

      const env = unwrapEnvelope(raw);
      console.log('🟢 KYC Documents Envelope:', env);

      if (!isOk(env)) return [];

      const data = pickData(env);
      if (Array.isArray(data)) {
        return data as KycDocument[];
      }

      // sometimes backends send { data: { data: [...] } } already handled above,
      // fallback to empty if not an array
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

      const raw = await apiService.get(`${API_CONFIG.ENDPOINTS.KYC.DOWNLOAD}/${documentId}`);
      console.log('🟢 KYC Download Raw:', raw);

      const env = unwrapEnvelope(raw);
      if (!isOk(env)) return null;

      const data = pickData(env);
      // backend returns a URL string in data
      if (typeof data === 'string') return data;

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
