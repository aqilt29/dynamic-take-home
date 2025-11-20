import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// This would normally be a database query
// For demo purposes, I'll use in-memory store
const users = new Map<
  string,
  { id: string; email: string; password: string; name: string }
>();

// custom error handling class for more information
class SignInError extends CredentialsSignin {
  constructor(code = "error") {
    super();
    this.code = code;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          if (users.has(email)) {
            throw new SignInError("User already exists");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Create new user
          const newUser = {
            id: crypto.randomUUID(),
            email,
            password: hashedPassword,
            name: email.split("@")[0],
          };

          users.set(email, newUser);

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
        } else {
          // Login mode
          const user = users.get(email);

          if (!user) {
            throw new SignInError("Invalid credentials");
          }

          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            throw new SignInError("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
