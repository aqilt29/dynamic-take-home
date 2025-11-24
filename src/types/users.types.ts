export enum AuthProviders {
  CREDENTIALS = "credentials",
  GOOGLE = "google",
  GITHUB = "github",
}

/** Dynamic Labs user payload */
export interface DynamicUser {
  id: string; // Dynamic Labs user ID (UUID)
  email: string;
  name: string | null;
  image: string | null;
}

/** DB row shape coming from Supabase */
export interface UserRow {
  id: string; // UUID (Dynamic Labs user ID)
  email: string;
  name: string | null;
  image: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  auth_provider: AuthProviders;
  hashed_password: string | null; // null for OAuth users
}

/** Insert DTO for creating/upserting users */
export interface UserInsertDTO {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  auth_provider?: AuthProviders; // default 'credentials' in DB if omitted
  hashed_password?: string | null;
}

export interface StoredUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  authProvider: AuthProviders;
  hashedPassword?: string | null;
}
