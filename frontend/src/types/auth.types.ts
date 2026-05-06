export interface UserPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  personalityType: string;
  isAdmin: boolean;
  isPremium: boolean;
  streakCount: number;
  streakActive: boolean;
  coinsBalance: number;
  createdAt?: string;
}
