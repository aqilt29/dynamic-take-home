/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { createDynamicUser, getUserByEmail } from "./lib/users";
import {
  createEmbeddedWallet,
  ensureDynamicUserAndWallet,
} from "./lib/dynamic";
import { AuthProviders } from "./types/users.types";
import { withCreationLock } from "./lib/auth-lock";

// custom error handling class for more information
class SignInError extends CredentialsSignin {
  constructor(code = "error") {
    super();
    this.code = code;
  }
}

/** Type guard: ensure provider is one of our enum values */
function isAuthProvider(p: unknown): p is AuthProviders {
  return Object.values(AuthProviders).includes(p as AuthProviders);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  jwt: {
    async encode({ token }) {
      // Get private key from environment
      const privateKeyBase64 = process.env.NEXTAUTH_JWT_PRIVATE_KEY;
      if (!privateKeyBase64) {
        throw new Error("NEXTAUTH_JWT_PRIVATE_KEY is not configured");
      }

      // Decode the base64 private key
      const privateKeyPem = Buffer.from(privateKeyBase64, "base64").toString(
        "utf-8"
      );

      // Import the private key
      const privateKey = await jose.importPKCS8(privateKeyPem, "RS256");

      // Sign the JWT with RS256
      const jwt = await new jose.SignJWT(token as any)
        .setProtectedHeader({ alg: "RS256", kid: "nextauth-rsa-key" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(privateKey);

      return jwt;
    },
    async decode({ token }) {
      // Get public key from environment
      const publicKeyBase64 = process.env.NEXTAUTH_JWT_PUBLIC_KEY;
      if (!publicKeyBase64) {
        throw new Error("NEXTAUTH_JWT_PUBLIC_KEY is not configured");
      }

      // Decode the base64 public key
      const publicKeyPem = Buffer.from(publicKeyBase64, "base64").toString(
        "utf-8"
      );

      // Import the public key
      const publicKey = await jose.importSPKI(publicKeyPem, "RS256");

      // Verify and decode the JWT
      const { payload } = await jose.jwtVerify(token!, publicKey);

      return payload as any;
    },
  },
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
        mode: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new SignInError("Email and password required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const mode = credentials.mode as string;

        if (mode === "register") {
          // Check if user already exists
          const dbUser = await getUserByEmail(email);

          if (dbUser) {
            throw new SignInError("User already exists");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          try {
            const dynamicUser = await createDynamicUser(
              email,
              AuthProviders.CREDENTIALS,
              hashedPassword
            );

            const embeddedWalletResult = await createEmbeddedWallet(
              dynamicUser.id
            );

            console.log({ embeddedWalletResult });

            // Create new user
            const newUser = {
              id: dynamicUser.id,
              email,
              password: hashedPassword,
              name: email.split("@")[0],
            };

            const safeName = newUser.name ?? email.split("@")[0] ?? "User";

            return {
              id: newUser.id,
              email: newUser.email,
              name: safeName,
            };
          } catch (error) {
            console.log("🚀 ~ generating dynamic user error:", error);
            throw new SignInError("Dynamic API Fail");
          }
        } else {
          // Login mode
          const existingUser = await getUserByEmail(email);

          if (!existingUser) {
            throw new SignInError("Invalid db user lookup");
          }

          if (!existingUser.hashedPassword) {
            throw new SignInError("Invalid db user pw lookup");
          }

          const isValidPassword = await bcrypt.compare(
            password,
            existingUser.hashedPassword
          );

          if (!isValidPassword) {
            throw new SignInError("Invalid credentials");
          }

          const safeName = existingUser.name ?? email.split("@")[0] ?? "User";

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: safeName,
          };
        }
      },
    }),
  ],
  callbacks: {
    // async signIn({ user, account }) {},
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // Ensure image has a fallback value
        if (!session.user.image) {
          session.user.image = "https://picsum.photos/200";
        }
        // @ts-ignore
        session.token = token;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email;
      }
      // Add issuer for Dynamic external auth
      token.iss = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return token;
    },
  },
});
