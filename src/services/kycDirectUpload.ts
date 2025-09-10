// kycDirectUpload.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = 'https://investpro.hmstech.xyz/api'; // no trailing slash
const KYC_UPLOAD_PATH = 'kyc/upload';                  // no leading slash

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface KycDocument {
  id: number;
  user_id: number;
  document_type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  file_path: string;
  original_filename: string;
  status: KycStatus;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface KycUploadApiResponse {
  status?: 'success' | 'error';
  success?: boolean;
  message?: string;
  data?: { data?: KycDocument } | KycDocument; // tolerate both shapes
}

export async function uploadKycDocumentDirect(
  documentType: KycDocument['document_type'],
  file: { uri: string; name?: string; mimeType?: string }
): Promise<KycDocument> {
  const token = await SecureStore.getItemAsync('authToken');
  if (!token) throw new Error('Not authenticated: token missing');

  // build form-data (do NOT set Content-Type manually)
  const form = new FormData();
  const safeName = file.name || `document_${Date.now()}`;
  const safeType = file.mimeType || 'application/octet-stream';

  // Some libraries/servers can be picky with iOS URIs.
  const safeUri = Platform.OS === 'ios' ? file.uri.replace('file://', 'file://') : file.uri;

  form.append('document_type', documentType);
  form.append('document', {
    uri: safeUri,
    name: safeName,
    type: safeType,
  } as any);

  const url = joinUrl(BASE_URL, KYC_UPLOAD_PATH);

  // simple timeout so requests don't hang forever
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`, // attach token explicitly
        // DO NOT set Content-Type here — fetch will set multipart boundary
      },
      body: form,
      signal: controller.signal,
    });
    console.log("upload kyc response", res);

    let payload: KycUploadApiResponse | undefined;
    const text = await res.text();
    try { payload = text ? (JSON.parse(text) as KycUploadApiResponse) : undefined; } catch { /* non-JSON */ }
    console.log('KYC direct upload response:', { status: res.status, ok: res.ok, payload, text });
    if (res.status === 401) {
      // don’t log the user out automatically — surface a clear error
      const msg = payload?.message || 'Unauthenticated.';
      throw new Error(`401 Unauthorized: ${msg}`);
    }

    if (!res.ok) {
      const msg = payload?.message || `Upload failed with HTTP ${res.status}`;
      throw new Error(msg);
    }

    const ok =
      payload?.status === 'success' ||
      payload?.success === true ||
      !!(payload?.data as any);

    if (!ok) {
      const msg = payload?.message || 'Unexpected server response';
      throw new Error(msg);
    }

    // unwrap { data: { data: {...} } } or { data: {...} } or plain object
    const doc =
      ((payload?.data as any)?.data as KycDocument) ||
      ((payload?.data as any) as KycDocument) ||
      (payload as any);

    if (!doc || !doc.id) {
      throw new Error('Server did not return the uploaded document');
    }
    return doc;
  } catch (err: any) {
    // normalize common errors
    if (err.name === 'AbortError') throw new Error('Network timeout. Please try again.');
    throw new Error(err?.message || 'Failed to upload document');
  } finally {
    clearTimeout(timeout);
  }
}
