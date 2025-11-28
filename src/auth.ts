/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { UserService, WalletService, FundingService } from "./services";
import { createEmbeddedWallet } from "./lib/dynamic";
import { AuthProviders } from "./types/users.types";
import { NEXTAUTH_CONFIG, validateNextAuthConfig } from "@/lib/config";

// custom error handling class for more information
class SignInError extends CredentialsSignin {
  constructor(code = "error") {
    super();
    this.code = code;
  }
}

/** Type guard: ensure provider is one of our enum values */
function isAuthProvider(providerId: string): AuthProviders {
  switch (providerId.toLowerCase()) {
    case "google":
      return AuthProviders.GOOGLE;
    case "github":
      return AuthProviders.GITHUB;
    case "credentials":
      return AuthProviders.CREDENTIALS;
    default:
      throw new SignInError(`Unknown provider: ${providerId}`);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  jwt: {
    async encode({ token }) {
      // Get private key from configuration
      validateNextAuthConfig();
      const privateKeyBase64 = NEXTAUTH_CONFIG.jwtPrivateKey;

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
      // Get public key from configuration
      validateNextAuthConfig();
      const publicKeyBase64 = NEXTAUTH_CONFIG.jwtPublicKey;

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
          const dbUser = await UserService.getByEmail(email);

          if (dbUser) {
            // Provide helpful error message based on their auth provider
            if (
              dbUser.authProvider === AuthProviders.GOOGLE ||
              dbUser.authProvider === AuthProviders.GITHUB
            ) {
              throw new SignInError(
                `Account exists. Please sign in with ${dbUser.authProvider}`
              );
            }
            throw new SignInError("User already exists");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          try {
            const dynamicUser = await UserService.create(
              email,
              AuthProviders.CREDENTIALS,
              hashedPassword
            );

            const embeddedWalletResult = await createEmbeddedWallet(
              dynamicUser.id
            );

            console.log({ embeddedWalletResult });

            try {
              const fundingResult = await FundingService.fundNewWallet(
                dynamicUser.id,
                embeddedWalletResult.accountAddress
              );

              if (fundingResult.success) {
                console.log(
                  `✅ New wallet funded: ${fundingResult.transactionHash}`
                );
              } else {
                console.warn(
                  `⚠️ Wallet funding failed: ${fundingResult.error}`
                );
                // Don't block signup
              }
            } catch (fundingError) {
              console.error("Funding error (non-blocking):", fundingError);
            }

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
          const existingUser = await UserService.getByEmail(email);

          if (!existingUser) {
            throw new SignInError("No account found. Please register first");
          }

          if (!existingUser.hashedPassword) {
            // User signed up with OAuth, tell them to use that provider
            throw new SignInError(
              `Please sign in with ${existingUser.authProvider}`
            );
          }

          const isValidPassword = await bcrypt.compare(
            password,
            existingUser.hashedPassword
          );

          if (!isValidPassword) {
            throw new SignInError("Invalid password");
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
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") {
        return true; // Credentials handled in authorize()
      }

      try {
        const email = user.email;
        if (!email) {
          console.error("No email provided by OAuth provider");
          return false;
        }

        // Check if user exists in our database
        const existingUser = await UserService.getByEmail(email);

        if (!existingUser) {
          // Create new user for OAuth sign-in
          const provider = isAuthProvider(account.provider);

          console.log(`Creating new ${provider} user: ${email}`);

          // Create user without password hash (provider is set)
          const dynamicUser = await UserService.create(email, provider);

          // Create embedded wallet for new OAuth user
          const embeddedWalletResult = await WalletService.createForUser(
            dynamicUser.id
          );

          console.log({ embeddedWalletResult });

          try {
            const fundingResult = await FundingService.fundNewWallet(
              dynamicUser.id,
              embeddedWalletResult.accountAddress
            );

            if (fundingResult.success) {
              console.log(
                `✅ OAuth wallet funded: ${fundingResult.transactionHash}`
              );
            } else {
              console.warn(
                `⚠️ OAuth wallet funding failed: ${fundingResult.error}`
              );
            }
          } catch (fundingError) {
            console.error("OAuth funding error (non-blocking):", fundingError);
          }
        }

        return true;
      } catch (error) {
        new SignInError(`Error in signIn callback:, ${error}`);
        return false;
      }
    },

    async session({ session, token, ...args }) {
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

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.email = user.email;
      }
      if (account) {
        token.provider = account.provider;
      }
      // Add issuer for Dynamic external auth
      token.iss = NEXTAUTH_CONFIG.url;
      return token;
    },
  },
});
