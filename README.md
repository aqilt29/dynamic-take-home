# Take-Home Exam - Next/React Project

## Demo Setup Instructions

### 1. Dependencies

Install dependencies first

```bash
npm install
```

### 2. Environment Variable Configuration

Copy `.env.example` to `.env.local` and fill in the values:
Note all of the prefixed variables with `AUTH_` will automatically be picked up by nextjs.

```bash
cp .env.example .env.local
```

I like to generate a secret with openssl for fun to populate `AUTH_SECRET=` with:

```bash
openssl rand -base64 32
```

> [!NOTE]
> The email credentials sign up and login will be stored in memory
> only and works perfectly fine for demonstration purposes. I just wanted
> to show off maybe a litle.

### 3. OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
4. Configure OAuth consent screen if prompted
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret** to `.env.local`

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** to `.env.local`

> [!WARNING]
> without the credentials for either service the logins for those wont work
> but the email login will work.

### 4. Run the Development Server

```bash
npm run dev
```

The server will run on the default port of 3000 so
you may then visit [http://localhost:3000](http://localhost:3000)

---

## Section 1: Demo

### Context

You received the following message from **Taylor**, a representative from a large enterprise prospect currently evaluating Dynamic:

> _My team has heard very positive things about Dynamic but we have several questions about how wallets work. We want to understand how our users can start using wallets instantly without needing to learn anything about crypto. The notes from my team are listed below. A small demo would help us understand how Dynamic works during our evaluation._

### Customer Issues

1. **Pre-generated Wallets**: Users should receive an embedded wallet immediately without setup by using pre-generated wallets
2. **Account Abstraction**: The team doesn't understand account abstraction or why it removes complexity for users who don't understand gas fees
3. **Wallet Visibility**: Users should easily see their wallet and balance in a simple format

### Task

Create a small demo application that addresses the concerns listed above. The goal is to demonstrate a smooth onboarding experience using Dynamic pre-generated embedded wallets along with account abstraction. The demo should be simple, functional, and easy for the customer to reference.

### Instructions

1. Set up the Dynamic SDK locally in a React application
2. Develop solutions to address each of the issues mentioned:
   - **a.** Create and claim a pre-generated wallet for the user so that their wallet is ready immediately when they sign in
   - **b.** Explain account abstraction and how it removes the need for users to understand gas fees
   - **c.** Explain how it works

### Deliverables for Demo

1. **Functional demo environment** that addresses the customer's concerns

   - Submit your code changes in a GitHub repository with clear commit messages
   - Include a README that explains the setup process and how you addressed the customer issues

2. **Short recorded Loom video** demonstrating how the demo works and explaining key aspects to Taylor

3. **Prepare a short live demo** you could walk the team through during a panel

---

## Additional Resources

- [NextAuth.js v5 Documentation](https://authjs.dev/reference/nextjs)
