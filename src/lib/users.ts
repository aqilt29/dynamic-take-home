import {
  AuthProviders,
  DynamicUser,
  StoredUser,
  UserInsertDTO,
  UserRow,
} from "@/types/users.types";
import { getSupabaseClient } from "./supabase-client";
import { DYNAMIC_API_BASE } from "./constants";

const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID || "";
const authToken = process.env.DYNAMIC_AUTH_TOKEN || "";

/**
 * Transform database row -> StoredUser (camelCase)
 */
export function userRowToStoredUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authProvider: row.auth_provider,
    hashedPassword: row.hashed_password,
  };
}

/**
 * Transform Dynamic Labs user -> insert DTO (snake_case)
 */
export function dynamicUserToInsertDTO(
  user: DynamicUser,
  authprovider: AuthProviders = AuthProviders.CREDENTIALS,
  hashedPassword: string | null = null
): UserInsertDTO {
  return {
    id: user.id, // still storing their Dynamic ID as PK
    email: user.email,
    name: user.name,
    image: user.image,
    auth_provider: authprovider,
    hashed_password: hashedPassword,
  };
}

/**
 * Lookup user by email
 */
export async function getUserByEmail(
  email: string
): Promise<StoredUser | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single<UserRow>();

  if (error) {
    if (error.code === "PGRST116") return undefined; // no rows
    console.error("Failed to get user by email:", error);
    throw new Error(`Failed to get user by email: ${error.message}`);
  }

  return data ? userRowToStoredUser(data) : undefined;
}

/**
 * Save/upsert a user into Supabase.
 * Uses email as the unique identity.
 *
 * If the user already exists, the insert will update name/image but
 * **will not override id** unless you explicitly want that.
 */
export async function saveUser(
  dynamicUser: DynamicUser,
  authprovider: AuthProviders = AuthProviders.CREDENTIALS,
  hashedPassword: string | null = null
): Promise<StoredUser> {
  const supabase = getSupabaseClient();
  const insertData: UserInsertDTO = dynamicUserToInsertDTO(
    dynamicUser,
    authprovider,
    hashedPassword
  );

  const { data, error } = await supabase
    .from("users")
    .upsert(insertData, {
      onConflict: "email", // <-- use email as the uniqueness key
    })
    .select("*")
    .single<UserRow>();

  if (error) {
    console.error("Failed to save user:", error);
    throw new Error(`Failed to save user: ${error.message}`);
  }

  return userRowToStoredUser(data);
}

/**
 * createDynamicUser using email as the key for api call
 */
export async function createDynamicUser(
  email: string,
  authprovider: AuthProviders = AuthProviders.CREDENTIALS,
  hashedPassword: string | null = null
): Promise<StoredUser> {
  // create a user here:

  const createUserUrl = `${DYNAMIC_API_BASE}/environments/${environmentId}/users`;
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  };

  try {
    const newUserResponse = await fetch(createUserUrl, options);
    const newUserResponseData = await newUserResponse.json();
    console.log(
      "🚀 ~ createDynamicUser ~ newUserResponseData:",
      newUserResponseData
    );

    return (await saveUser(
      newUserResponseData.user,
      authprovider,
      hashedPassword
    )) as StoredUser;
  } catch (error) {
    console.log("🚀 ~ createDynamicUser ~ error:", error);
    console.error(error);
    throw error;
  }
}
