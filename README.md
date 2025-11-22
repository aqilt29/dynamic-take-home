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

### 3. API Keys

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

#### Dynamic API Keys (Required)

1. Go to [Dynamic Developer Dashboard](https://app.dynamic.xyz/dashboard/developer/api)
2. Copy your **Environment ID** to `DYNAMIC_ENVIRONMENT_ID` in `.env.local`
3. Generate or copy your **API Token** to `DYNAMIC_AUTH_TOKEN` in `.env.local`

> [!IMPORTANT]
> Dynamic API keys are **required** for the wallet functionality to work. Without them, users will not be able to create or access wallets.

#### BaseScan API Key (Required for Transaction History)

1. Go to [BaseScan](https://basescan.org/register) and create a free account
2. Navigate to API-KEYs section and create a new API key
3. Copy the **API Key** to `BASESCAN_API_KEY` in `.env.local`

> [!NOTE]
> The BaseScan API key is used to fetch transaction history on the dashboard. The app will work without it, but transaction history won't be displayed.

> [!WARNING]
> OAuth credentials (Google/GitHub) are optional. Without them, those specific login methods won't work, but email login will still function.

### 4. Run the Development Server

```bash
npm run dev
```

The server will run on the default port of 3000 so
you may then visit [http://localhost:3000](http://localhost:3000)

---

## How This Demo Addresses Customer Requirements

### 1. Pre-generated Wallets ✅

- Wallets are automatically created when users sign up using Dynamic's WaaS API
- No setup required - users receive a wallet instantly on first login
- Each wallet is uniquely associated with the user's email address
- Wallets persist across sessions and are managed by Dynamic's infrastructure

**Implementation**: `GET /api/wallets` endpoint calls Dynamic's `/waas/create` API with the user's email identifier

### 2. Account Abstraction ✅

- Wallet card displays an informational section explaining account abstraction
- Clear messaging: "You don't need to worry about gas fees or managing private keys"
- Transactions are simplified and secured automatically

**User Experience**: Account abstraction info is shown on `/dashboard/wallets` page

### 3. Wallet Visibility ✅

- **Dashboard Home**: User profile card displays wallet address with copy functionality
- **Wallets Page**: Detailed wallet information including balance on Base Sepolia testnet
- **Transaction History**: Table showing all transactions with status, value, and timestamps
- Clean, responsive UI built with shadcn/ui components

**Pages**:

- `/dashboard` - Overview with user info and transaction history
- `/dashboard/wallets` - Detailed wallet management

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
