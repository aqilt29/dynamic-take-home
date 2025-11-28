# Embedded Wallets Application

![Home Screen Demo Shot](demo-home-screen.png)

A Next.js application for managing embedded cryptocurrency wallets with account abstraction, gas-free transactions, and auto-funding capabilities.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Routes](#api-routes)
- [Key Features](#key-features)

---

## Overview

This application provides a seamless wallet experience using Dynamic Labs' WaaS (Wallet-as-a-Service) and ZeroDev's account abstraction. Users can create wallets, send ETH gas-free transactions, and track transaction history on Base Sepolia testnet.

**Key Capabilities:**

- Multi-provider authentication (Email/Password, Google OAuth, GitHub OAuth)
- Automatic embedded wallet creation on signup
- Gas-sponsored transactions via ZeroDev
- Auto-funding for new wallets
- Transaction history tracking
- Entirely serverside handling of sponsored transactions

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5
- **Database**: Supabase (PostgreSQL)
- **Wallet Infrastructure**: Dynamic Labs WaaS
- **Account Abstraction**: ZeroDev
- **Blockchain**: Base Sepolia (Testnet)
- **UI Components**: Radix UI + Tailwind CSS
- **Type Safety**: TypeScript + Zod
- **Ethereum Library**: Viem

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Supabase account** (free tier works)
- **Dynamic Labs account** (free tier works)
- **BaseScan API key** (free)

### Optional OAuth Providers:

- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/aqilt29/dynamic-take-home.git
cd dynamic-take-home
```

### 2. Install dependencies

```bash
npm install
```

---

## Database Setup

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details and create

### 2. Run Database Migrations

Navigate to the SQL Editor in your Supabase project and execute the following scripts in order:

#### Step 1: Create Types

```sql
-- supabase_scripts/01_create_types.sql
do $$
begin
  if not exists (select 1 from pg_type where typname = 'auth_provider') then
    create type public.auth_provider as enum (
      'credentials',
      'google',
      'github'
    );
  end if;
end$$;
```

#### Step 2: Create Users Table

```sql
-- supabase_scripts/02_create_users_table.sql
create table if not exists public.users (
  id uuid not null default gen_random_uuid(),
  email text not null,
  name text null,
  image text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  auth_provider public.auth_provider not null default 'credentials'::auth_provider,
  hashed_password text null,
  is_admin boolean not null default false,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_email_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
create index if not exists users_email_idx on public.users using btree (email);
create index if not exists users_created_at_idx on public.users using btree (created_at desc);
create index if not exists users_auth_provider_idx on public.users using btree (auth_provider);

-- Add comments
comment on table public.users is 'User accounts with multi-provider authentication support';
comment on column public.users.auth_provider is 'Authentication method used for this account';
comment on column public.users.hashed_password is 'Only populated for credentials-based auth';
comment on column public.users.is_admin is 'Admin flag for auto-funding management';
```

#### Step 3: Create Wallets Table

```sql
-- supabase_scripts/03_create_wallets_table.sql
create table public.wallets (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  wallet_id text not null,
  account_address text not null,
  public_key_hex text not null,
  raw_public_key jsonb not null,
  external_server_key_shares jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint wallets_pkey primary key (id),
  constraint wallets_account_address_key unique (account_address),
  constraint wallets_user_id_key unique (user_id),
  constraint wallets_wallet_id_key unique (wallet_id),
  constraint wallets_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Create indexes
create index IF not exists wallets_user_id_idx on public.wallets using btree (user_id) TABLESPACE pg_default;
create index IF not exists wallets_wallet_id_idx on public.wallets using btree (wallet_id) TABLESPACE pg_default;
create index IF not exists wallets_account_address_idx on public.wallets using btree (account_address) TABLESPACE pg_default;
create index IF not exists wallets_created_at_idx on public.wallets using btree (created_at desc) TABLESPACE pg_default;

-- Add comments
comment on table public.wallets is 'Cryptocurrency wallets associated with user accounts';
comment on column public.wallets.wallet_id is 'Unique identifier for the wallet';
comment on column public.wallets.account_address is 'Blockchain account address';
comment on column public.wallets.raw_public_key is 'Raw public key data in JSON format';
comment on column public.wallets.external_server_key_shares is 'Encrypted key shares stored externally';
```

#### Step 4: Create Funding Transactions Table (Optional - for auto-funding)

```sql
-- For auto-funding feature
create table public.funding_transactions (
  id uuid not null default gen_random_uuid (),
  from_wallet_address character varying(42) not null,
  to_wallet_address character varying(42) not null,
  to_user_id uuid null,
  amount character varying(255) not null,
  transaction_hash character varying(66) null,
  status character varying(50) not null,
  error_message text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint funding_transactions_pkey primary key (id),
  constraint funding_transactions_to_user_id_fkey foreign KEY (to_user_id) references users (id)
) TABLESPACE pg_default;

-- Create indexes
create index if not exists funding_transactions_to_user_id_idx on public.funding_transactions using btree (to_user_id);
create index if not exists funding_transactions_status_idx on public.funding_transactions using btree (status);
create index if not exists funding_transactions_created_at_idx on public.funding_transactions using btree (created_at desc);

comment on table public.funding_transactions is 'Audit log for wallet funding operations';
```

### 3. Get Supabase Credentials

From your Supabase project settings:

1. Go to **Settings** → **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Environment Configuration

### 1. Create `.env.local`

Copy the example file:

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

#### Variables

```bash
# NextAuth Configuration
AUTH_SECRET="<generate-with: openssl rand -base64 32>"
NEXTAUTH_SECRET="<same-as-AUTH_SECRET>"
NEXTAUTH_URL="http://localhost:3000"

# JWT Signing Keys (RS256) - Generate with scripts/generate-jwt-keys.ts
NEXTAUTH_JWT_PRIVATE_KEY="<base64-encoded-private-key>"
NEXTAUTH_JWT_PUBLIC_KEY="<base64-encoded-public-key>"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Dynamic Labs Configuration
DYNAMIC_ENVIRONMENT_ID="your-environment-id"
DYNAMIC_AUTH_TOKEN="dyn_..."
DYNAMIC_WEBHOOK_SECRET="dyn_..."

# Optional from Dynamic webhooks setup
DELEGATION_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# Optional for storing webhook result not implemented but planned
STORAGE_ENCRYPTION_KEY="<base64-encoded-32-byte-key>"

# BaseScan API Key
BASESCAN_API_KEY="your-basescan-api-key"
```

#### OAuth Variables

```bash
# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-..."

# GitHub OAuth
AUTH_GITHUB_ID="Ov23..."
AUTH_GITHUB_SECRET="..."
```

#### Auto-Funding Configuration (Optional)

```bash
# Auto-Funding Feature
ADMIN_WALLET_EMAIL="admin@example.com"
DEFAULT_FUNDING_AMOUNT="0.001"
ENABLE_AUTO_FUNDING="true"
```

### 3. Obtaining API Keys

#### Dynamic Labs Setup

1. Visit [Dynamic Developer Dashboard](https://app.dynamic.xyz/dashboard)
2. Create a new project or select existing
3. Go to **Developer** → **API**
4. Copy **Environment ID** → `DYNAMIC_ENVIRONMENT_ID`
5. Generate **API Token** → `DYNAMIC_AUTH_TOKEN`
6. Go to **Webhooks** → Copy webhook secret → `DYNAMIC_WEBHOOK_SECRET`

#### BaseScan/Etherscan API Key

> [!NOTE]
> The basescan api uses the etherscan API keys

1. Visit [Etherscan](https://basescan.org/register)
2. Create a free account
3. Navigate to **API-KEYs** section
4. Create new API key → `BASESCAN_API_KEY`

> [!WARNING]
> Without these keys the buttons for these auth
> functions will load on the UI but they will not work

#### Google OAuth (Optional)

1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth 2.0 Client ID
3. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret

#### GitHub OAuth (Optional)

1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret

### 4. Generate JWT Keys

```bash
# Generate RSA key pair for JWT signing
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Base64 encode for environment variables
cat private.pem | base64 | tr -d '\n'
cat public.pem | base64 | tr -d '\n'
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## API Routes

### User Routes

#### `GET /api/user`

**Description**: Get current authenticated user's information
**Authentication**: Required
**Response**:

```typescript
{
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    authProvider: "credentials" | "google" | "github";
    createdAt: string;
    updatedAt: string;
  }
}
```

**Error Responses**:

- `401 Unauthorized` - No valid session
- `404 Not Found` - User not found in database
- `500 Internal Server Error` - Server error

---

### Wallet Routes

#### `GET /api/wallets`

**Description**: Get authenticated user's wallet information
**Authentication**: Required
**Response**:

```typescript
{
  success: boolean;
  data: {
    address: string; // Ethereum address (0x...)
    publicKey: string; // Hex-encoded public key
    walletId: string; // Dynamic wallet ID
  }
}
```

**Error Responses**:

- `401 Unauthorized` - No valid session
- `404 Not Found` - User or wallet not found
- `500 Internal Server Error` - Failed to fetch wallet

---

### Transaction Routes

#### `POST /api/transactions/send`

**Description**: Send a gas-sponsored transaction using ZeroDev
**Authentication**: Required
**Request Body**:

```typescript
{
  to: string;           // Recipient address (0x...)
  value: string;        // Amount in wei (string for BigInt support)
  walletAddress: string; // Sender's wallet address
  data?: `0x${string}`; // Optional contract call data
}
```

**Response**:

```typescript
{
  success: boolean;
  data: {
    success: boolean;
    transactionHash: string; // Transaction hash (0x...)
  }
}
```

**Error Responses**:

- `401 Unauthorized` - No valid session
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Transaction failed

#### `GET /api/transactions/history`

**Description**: Get transaction history for authenticated user's wallet
**Authentication**: Required
**Response**:

```typescript
{
  success: boolean;
  data: Array<{
    hash: string; // Transaction hash
    from: string; // Sender address
    to: string; // Recipient address
    value: string; // Amount in wei
    blockNumber: string; // Block number
    timeStamp: string; // Unix timestamp
    confirmations: string; // Number of confirmations
    isError: string; // "0" = success, "1" = failed
    txreceipt_status: string; // "1" = success, "0" = failed
  }>;
}
```

**Error Responses**:

- `401 Unauthorized` - No valid session
- `404 Not Found` - User or wallet not found
- `503 Service Unavailable` - BaseScan API error

---

### Webhook Routes

> [!NOTE]
> This feature was implemented only partially during my development process for testing
> this doesnt really work for any real purposes just yet.

#### `POST /api/webhooks/dynamic/delegation`

**Description**: Handle Dynamic Labs delegation webhooks
**Authentication**: Webhook signature verification
**Request Body**: Dynamic Labs webhook payload
**Response**: 200 OK if processed successfully

---

## Key Features

### 1. Multi-Provider Authentication

- Email/Password authentication with bcrypt hashing
- Google OAuth integration
- GitHub OAuth integration
- Secure session management with NextAuth.js

### 2. Embedded Wallet Management

- Automatic wallet creation on signup
- Dynamic Labs WaaS integration
- Wallet address and balance display
- QR code support for easy sharing

### 3. Account Abstraction

- Gas-free transactions via ZeroDev
- No private key management required
- Simplified transaction UX

### 4. Auto-Funding System

- Automatically fund new wallets on creation
- Configurable funding amount
- Admin wallet designation
- Transaction audit logging
- Graceful error handling (never blocks signup)

### 5. Transaction Features

- Send ETH on Base Sepolia testnet
- Real-time transaction status
- Transaction history with BaseScan integration
- Input validation and error handling

### 6. Dashboard

- User profile overview
- Wallet balance tracking
- Transaction history table
- Responsive design with dark mode support

---

## Environment Variables Reference

| Variable                        | Required | Description                             |
| ------------------------------- | -------- | --------------------------------------- |
| `AUTH_SECRET`                   | Yes      | NextAuth session encryption key         |
| `NEXTAUTH_URL`                  | Yes      | Application base URL                    |
| `NEXTAUTH_JWT_PRIVATE_KEY`      | Yes      | Base64-encoded RSA private key          |
| `NEXTAUTH_JWT_PUBLIC_KEY`       | Yes      | Base64-encoded RSA public key           |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key               |
| `DYNAMIC_ENVIRONMENT_ID`        | Yes      | Dynamic Labs environment ID             |
| `DYNAMIC_AUTH_TOKEN`            | Yes      | Dynamic Labs API token                  |
| `BASESCAN_API_KEY`              | Yes      | Etherscan API key used for Basescan API |
| `DYNAMIC_WEBHOOK_SECRET`        | No       | Dynamic webhook verification            |
| `DELEGATION_PRIVATE_KEY`        | No       | Dynamic delegation private key          |
| `STORAGE_ENCRYPTION_KEY`        | No       | Storage encryption key                  |
| `AUTH_GOOGLE_ID`                | No       | Google OAuth client ID                  |
| `AUTH_GOOGLE_SECRET`            | No       | Google OAuth client secret              |
| `AUTH_GITHUB_ID`                | No       | GitHub OAuth client ID                  |
| `AUTH_GITHUB_SECRET`            | No       | GitHub OAuth client secret              |
| `ADMIN_WALLET_EMAIL`            | No       | Admin wallet for auto-funding           |
| `DEFAULT_FUNDING_AMOUNT`        | No       | Default funding amount in ETH           |
| `ENABLE_AUTO_FUNDING`           | No       | Enable/disable auto-funding             |

---

## Development Notes

### TypeScript Configuration

The project uses strict TypeScript with ES2020 features for BigInt support in blockchain operations.

### API Layer Architecture

- **Routes** (`src/app/api/*`) - HTTP endpoint handlers
- **Services** (`src/services/*`) - Business logic and external integrations
- **Lib** (`src/lib/*`) - Utilities, configuration, and helpers

### Error Handling

All API routes use centralized error handling via [`CommonErrors`](/src/lib/api/responses.ts) utility with consistent error responses.

### Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens signed with RSA-256
- Environment variables never exposed to client

---

## Troubleshooting

### Build Errors

- Ensure Node.js version is 20.x or higher
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Verify all required environment variables are set

### Database Connection Issues

- Verify Supabase credentials in `.env.local`
- Check Supabase project is active and not paused
- Ensure database migrations have been run

### Transaction Failures

- Verify ZeroDev sponsorship is configured in Dynamic Labs
- Check wallet has been created successfully
- Ensure Base Sepolia network is selected

### OAuth Login Issues

- Verify redirect URLs match exactly in provider settings
- Check OAuth credentials are correct
- Ensure `NEXTAUTH_URL` matches your application URL

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
