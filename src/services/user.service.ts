/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * User Service
 * Business logic for user operations
 */

import {
  AuthProviders,
  DynamicUser,
  StoredUser,
  UserInsertDTO,
  UserRow,
} from "@/types/users.types";
import { getSupabaseClient } from "@/lib/supabase-client";
import { DYNAMIC_API_BASE } from "@/lib/constants";

const environmentId = process.env.DYNAMIC_ENVIRONMENT_ID || "";
const authToken = process.env.DYNAMIC_AUTH_TOKEN || "";

/**
 * UserService - Handles user-related business logic
 */
export class UserService {
  /**
   * Get user by email
   */
  static async getByEmail(email: string): Promise<StoredUser | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single<UserRow>();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      console.error("Failed to get user by email:", error);
      throw new Error(`Failed to get user by email: ${error.message}`);
    }

    return data ? this.mapToStoredUser(data) : null;
  }

  /**
   * Get user by ID
   */
  static async getById(id: string): Promise<StoredUser | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single<UserRow>();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      console.error("Failed to get user by id:", error);
      throw new Error(`Failed to get user by id: ${error.message}`);
    }

    return data ? this.mapToStoredUser(data) : null;
  }

  /**
   * Create user in both Dynamic Labs and database
   */
  static async create(
    email: string,
    authProvider: AuthProviders = AuthProviders.CREDENTIALS,
    hashedPassword: string | null = null
  ): Promise<StoredUser> {
    // Create user in Dynamic Labs first
    const dynamicUser = await this.createInDynamic(email);

    // Then save to our database
    return this.save(dynamicUser, authProvider, hashedPassword);
  }

  /**
   * Save/upsert user to database
   * Uses email as the unique identifier
   */
  static async save(
    dynamicUser: DynamicUser,
    authProvider: AuthProviders = AuthProviders.CREDENTIALS,
    hashedPassword: string | null = null
  ): Promise<StoredUser> {
    const supabase = getSupabaseClient();

    const insertData: UserInsertDTO = this.mapToInsertDTO(
      dynamicUser,
      authProvider,
      hashedPassword
    );

    const { data, error } = await supabase
      .from("users")
      .upsert(insertData, {
        onConflict: "email", // Use email as uniqueness key
      })
      .select("*")
      .single<UserRow>();

    if (error) {
      console.error("Failed to save user:", error);
      throw new Error(`Failed to save user: ${error.message}`);
    }

    return this.mapToStoredUser(data);
  }

  /**
   * Update user information
   */
  static async update(
    id: string,
    updates: Partial<Pick<StoredUser, "name" | "image">>
  ): Promise<StoredUser> {
    const supabase = getSupabaseClient();

    const updateData: Record<string, any> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.image !== undefined) updateData.image = updates.image;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single<UserRow>();

    if (error) {
      console.error("Failed to update user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return this.mapToStoredUser(data);
  }

  /**
   * Search users by email or name (admin function)
   */
  static async search(query: string, limit = 20): Promise<StoredUser[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Failed to search users:", error);
      throw new Error(`Failed to search users: ${error.message}`);
    }

    return data ? data.map((row) => this.mapToStoredUser(row)) : [];
  }

  /**
   * Link OAuth account to existing user
   */
  static async linkOAuthAccount(
    userId: string,
    provider: AuthProviders
  ): Promise<StoredUser> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("users")
      .update({ auth_provider: provider })
      .eq("id", userId)
      .select("*")
      .single<UserRow>();

    if (error) {
      console.error("Failed to link OAuth account:", error);
      throw new Error(`Failed to link OAuth account: ${error.message}`);
    }

    return this.mapToStoredUser(data);
  }

  /**
   * Delete user (soft delete or hard delete based on needs)
   */
  static async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete user:", error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Check if user exists by email
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const user = await this.getByEmail(email);
    return user !== null;
  }

  /**
   * Private: Create user in Dynamic Labs
   */
  private static async createInDynamic(email: string): Promise<DynamicUser> {
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
      const response = await fetch(createUserUrl, options);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create Dynamic user: ${JSON.stringify(errorData)}`
        );
      }

      const responseData = await response.json();
      console.log("✅ Dynamic user created:", responseData.user.email);

      return responseData.user;
    } catch (error) {
      console.error("Failed to create Dynamic user:", error);
      throw error;
    }
  }

  /**
   * Private: Map DynamicUser to UserInsertDTO (database format)
   */
  private static mapToInsertDTO(
    user: DynamicUser,
    authProvider: AuthProviders = AuthProviders.CREDENTIALS,
    hashedPassword: string | null = null
  ): UserInsertDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      auth_provider: authProvider,
      hashed_password: hashedPassword,
    };
  }

  /**
   * Private: Map database row to StoredUser (camelCase)
   */
  private static mapToStoredUser(row: UserRow): StoredUser {
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
}

/**
 * Legacy exports for backward compatibility
 * TODO: Remove these once all code is migrated to UserService
 */
export const getUserByEmail = UserService.getByEmail;
export const saveUser = UserService.save;
export const createDynamicUser = UserService.create;

// Also export transformation functions for backward compatibility
export const userRowToStoredUser = (row: UserRow): StoredUser =>
  UserService["mapToStoredUser"](row);

export const dynamicUserToInsertDTO = (
  user: DynamicUser,
  authProvider: AuthProviders = AuthProviders.CREDENTIALS,
  hashedPassword: string | null = null
): UserInsertDTO =>
  UserService["mapToInsertDTO"](user, authProvider, hashedPassword);
