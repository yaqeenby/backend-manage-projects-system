export type AuthUser = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  permissions?: string[];
};
