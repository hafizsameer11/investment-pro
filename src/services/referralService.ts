import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';

export interface ReferralUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  status: string;
}

export interface ReferralStats {
  total_referrals: number;
  total_earnings: number;
  referral_code: string;
  per_user_bonus: number;
  level_1_referrals: number;
  level_2_referrals: number;
  level_3_referrals: number;
  level_4_referrals: number;
  level_5_referrals: number;
}

export interface ReferralNetworkNode {
  id: number;
  name: string;
  email: string;
  user_code: string;
  level: number;
  joined_at: string;
  status: string;
  sub_referrals: ReferralNetworkNode[];
}

export interface ReferralData {
  referrals: ReferralUser[];
  stats: {
    total_referrals: number;
    total_earnings: number;
    referral_code: string;
  };
}

/**
 * Safely unwrap common API response shapes:
 * - axios raw: { data: ... }
 * - our apiService returns data already: {...}
 * - wrapped: { status, message, data: {...} }
 */
function extractPayload(resp: any) {
  // resp may already be the payload if apiService unwraps .data
  const root = resp?.data ?? resp;
  return root?.data ?? root;
}

function toNumber(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export const referralService = {
  /**
   * Get users who joined with the current user's referral code (Level 1)
   * Accepts any of:
   * - { status, message, data: { referrals: [...], stats: {...} } }
   * - { referrals: [...], stats: {...} }
   * - [ ... ] (array only)
   */
  async getMyReferrals(): Promise<ReferralData> {
    const resp = await apiService.get<any>(API_CONFIG.ENDPOINTS.REFERRAL.MY_REFERRALS);
    const payload = extractPayload(resp);

    // Possible shapes:
    // payload = { referrals: [...], stats: {...} }
    // payload = [ ... ]
    // payload = { data: [ ... ] } (older)
    const referralsRaw =
      (Array.isArray(payload?.referrals) && payload.referrals) ||
      (Array.isArray(payload) && payload) ||
      (Array.isArray(payload?.data) && payload.data) ||
      [];

    const statsRaw = payload?.stats ?? {};

    // Normalize referrals to ReferralUser shape (backend already does this, but be safe)
    const referrals: ReferralUser[] = referralsRaw.map((u: any): ReferralUser => ({
      id: toNumber(u?.id),
      name: String(u?.name ?? ''),
      email: String(u?.email ?? ''),
      created_at: String(u?.created_at ?? ''),
      status: String(u?.status ?? 'pending'),
    }));

    return {
      referrals,
      stats: {
        total_referrals: toNumber(statsRaw?.total_referrals ?? referrals.length, 0),
        total_earnings: toNumber(statsRaw?.total_earnings ?? 0, 0),
        referral_code: String(statsRaw?.referral_code ?? ''),
      },
    };
  },

  /**
   * Get multi-level referral network (currently Level 1 from backend)
   * Accepts any of:
   * - { status, message, data: { level1: [...] } }
   * - { level1: [...] }
   * - [ ... ]
   */
  async getReferralNetwork(): Promise<ReferralNetworkNode[]> {
    const resp = await apiService.get<any>(API_CONFIG.ENDPOINTS.REFERRAL.NETWORK);
    const payload = extractPayload(resp);

    const level1 =
      (Array.isArray(payload?.level1) && payload.level1) ||
      (Array.isArray(payload) && payload) ||
      [];

    // Backend returns users directly (no nested .user), but also support a nested variant
    return level1.map((item: any) => ({
      id: toNumber(item?.id),
      name: String(item?.user?.name ?? item?.name ?? ''),
      email: String(item?.user?.email ?? item?.email ?? ''),
      user_code: String(item?.user?.user_code ?? item?.user_code ?? ''),
      level: 1,
      joined_at: String(item?.created_at ?? item?.joined_at ?? ''),
      status: String(item?.user?.status ?? item?.status ?? 'pending'),
      sub_referrals: [],
    }));
  },

  /**
   * Get referral statistics
   * Accepts any of:
   * - { status, message, data: { ...snake_case... } }
   * - { ...snake_case... }
   * - { ...camelCase... } legacy
   */
  async getReferralStats(): Promise<ReferralStats> {
    const resp = await apiService.get<any>(API_CONFIG.ENDPOINTS.REFERRAL.STATS);
    const p = extractPayload(resp);

    // Try snake_case first, then fallback to camelCase legacy keys
    const stats: ReferralStats = {
      total_referrals: toNumber(p?.total_referrals ?? p?.totalReferrals, 0),
      total_earnings: toNumber(p?.total_earnings ?? p?.totalEarnings, 0),
      referral_code: String(p?.referral_code ?? p?.referralCode ?? ''),
      per_user_bonus: toNumber(p?.per_user_bonus ?? p?.perUserBonus, 0),
      level_1_referrals: toNumber(p?.level_1_referrals ?? p?.level1Referrals ?? p?.activeReferrals, 0),
      level_2_referrals: toNumber(p?.level_2_referrals ?? p?.level2Referrals, 0),
      level_3_referrals: toNumber(p?.level_3_referrals ?? p?.level3Referrals, 0),
      level_4_referrals: toNumber(p?.level_4_referrals ?? p?.level4Referrals, 0),
      level_5_referrals: toNumber(p?.level_5_referrals ?? p?.level5Referrals, 0),
    };

    return stats;
  },
};
