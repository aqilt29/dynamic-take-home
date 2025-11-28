import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconInfoCircle,
  IconRocket,
  IconShield,
  IconWallet,
} from "@tabler/icons-react";

export default async function FAQs() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">
          Everything you need to know about embedded wallets, account
          abstraction, and gasless transactions
        </p>
      </div>

      <div className="space-y-6">
        {/* Quick Overview */}
        <Alert>
          <IconInfoCircle className="size-4" />
          <AlertDescription>
            This demo showcases how Dynamic&apos;s embedded wallets with account
            abstraction provide a seamless, Web2-like experience for users who
            don&apos;t understand cryptocurrency or blockchain technology.
          </AlertDescription>
        </Alert>

        {/* Pre-generated Wallets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWallet className="size-5" />
              Pre-generated Wallets
            </CardTitle>
            <CardDescription>
              Instant wallet creation without user setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-are-pregenerated">
                <AccordionTrigger>
                  What are pre-generated wallets?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Pre-generated wallets are cryptocurrency wallets that are
                    automatically created for users the moment they sign up,
                    without requiring any manual setup, seed phrase management,
                    or blockchain knowledge.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Think of it like getting an email address when you sign up
                    for Gmail it&apos;s instant, automatic, and requires no
                    technical understanding of email servers or SMTP protocols.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-instant">
                <AccordionTrigger>
                  How are wallets created instantly?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    When a user signs up,{" "}
                    <a
                      href="https://docs.dynamic.xyz/wallets/embedded-wallets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      Dynamic&apos;s Wallet-as-a-Service (WaaS)
                    </a>{" "}
                    API automatically:
                  </p>
                  <ol className="ml-4 list-decimal space-y-2 text-sm">
                    <li>
                      Creates a new embedded wallet using secure key generation
                    </li>
                    <li>
                      Links the wallet to the user&apos;s email or OAuth account
                    </li>
                    <li>
                      Stores encrypted key shares across multiple secure
                      locations
                    </li>
                    <li>Makes the wallet immediately available for use</li>
                  </ol>
                  <p className="text-sm text-muted-foreground">
                    The entire process happens in the background during
                    authentication, typically completing in under 2 seconds.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="no-seed-phrase">
                <AccordionTrigger>
                  Do users need to manage seed phrases?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    <strong>No.</strong> Users never see or manage seed phrases,
                    private keys, or any cryptographic material.
                  </p>
                  <p>
                    Dynamic uses{" "}
                    <a
                      href="https://www.dynamic.xyz/docs/wallets/embedded-wallets/mpc/overview#secured-by-tss-mpc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      threshold signature schemes (TSS)
                    </a>{" "}
                    where the private key is split into multiple encrypted
                    shares stored across different secure servers. This means:
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-sm">
                    <li>
                      No single point of failure even if one server is
                      compromised, keys remain secure
                    </li>
                    <li>
                      Users authenticate with familiar methods (email, Google,
                      GitHub) instead of managing keys
                    </li>
                    <li>
                      Account recovery works like any other app no lost seed
                      phrases = lost funds
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Account Abstraction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="size-5" />
              Account Abstraction
            </CardTitle>
            <CardDescription>
              Removing complexity and improving user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is-aa">
                <AccordionTrigger>
                  What is account abstraction?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Account abstraction (specifically{" "}
                    <a
                      href="https://eips.ethereum.org/EIPS/eip-4337"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      ERC-4337
                    </a>
                    ) transforms Ethereum wallets from simple key-pair accounts
                    into programmable smart contract wallets with advanced
                    features.
                  </p>
                  <p className="font-semibold">Traditional Wallets:</p>
                  <ul className="ml-4 list-disc space-y-1 text-sm">
                    <li>Must hold ETH to pay for any transaction</li>
                    <li>
                      Transaction fails if you don&apos;t have enough ETH for
                      gas
                    </li>
                    <li>Every transaction requires manual gas fee approval</li>
                    <li>Limited to basic send/receive functionality</li>
                  </ul>

                  <p className="mt-3 font-semibold">
                    Account Abstraction Wallets:
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-sm">
                    <li>Can receive sponsored transactions (no ETH needed)</li>
                    <li>Pay gas in any token (USDC, USDT, etc.)</li>
                    <li>Batch multiple operations into one transaction</li>
                    <li>
                      Support advanced features like social recovery and
                      spending limits
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="why-matters">
                <AccordionTrigger>
                  Why does account abstraction matter for our users?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Account abstraction solves the #1 UX problem in crypto: the
                    requirement for users to understand and manage gas fees.
                  </p>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="mb-2 font-semibold">Real-World Impact:</p>
                    <ul className="ml-4 list-disc space-y-2 text-sm">
                      <li>
                        <strong>Onboarding friction removed:</strong> Users can
                        start using your app immediately without first buying
                        ETH from an exchange
                      </li>
                      <li>
                        <strong>Higher conversion rates:</strong> Users
                        don&apos;t abandon transactions because they don&apos;t
                        have gas or don&apos;t understand gas fees
                      </li>
                      <li>
                        <strong>Web2-like experience:</strong> Users interact
                        with blockchain apps as smoothly as Netflix or Gmail
                      </li>
                      <li>
                        <strong>Predictable costs:</strong> You control what to
                        sponsor, users never face surprise fees
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="gas-fees-explained">
                <AccordionTrigger>
                  What are gas fees and why are they confusing?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Gas fees are transaction costs paid to blockchain validators
                    for processing operations. They&apos;re confusing because:
                  </p>
                  <ul className="ml-4 list-disc space-y-2 text-sm">
                    <li>
                      <strong>Variable pricing:</strong> Fees change based on
                      network congestion (can be $1 or $50 for the same
                      transaction)
                    </li>
                    <li>
                      <strong>Paid in native token:</strong> You must hold ETH
                      even if you&apos;re only working with USDC or other tokens
                    </li>
                    <li>
                      <strong>Estimation required:</strong> You must predict how
                      much gas you&apos;ll need before sending
                    </li>
                    <li>
                      <strong>Failed transactions still cost money:</strong> If
                      a transaction fails, you still lose the gas fee
                    </li>
                  </ul>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Imagine if using Gmail required you to understand server
                    costs, estimate bandwidth usage, and pay in a special
                    currency before sending each email that&apos;s what
                    traditional crypto UX feels like to non-technical users.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-aa-removes-complexity">
                <AccordionTrigger>
                  How does account abstraction remove this complexity?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Account abstraction uses a component called a{" "}
                    <strong>Paymaster</strong> to handle gas fees on behalf of
                    users:
                  </p>
                  <div className="space-y-4">
                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20">
                      <p className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                        How It Works:
                      </p>
                      <ol className="ml-4 list-decimal space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li>
                          User signs a transaction (e.g., &quot;send 10
                          USDC&quot;)
                        </li>
                        <li>
                          The Paymaster smart contract verifies the transaction
                          should be sponsored
                        </li>
                        <li>
                          Paymaster pays the gas fee in ETH on behalf of the
                          user
                        </li>
                        <li>
                          User&apos;s transaction executes successfully without
                          them needing ETH
                        </li>
                      </ol>
                    </div>

                    <p className="text-sm">
                      In this demo, we use{" "}
                      <a
                        href="https://docs.zerodev.app/smart-wallet/sponsoring-gas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        ZeroDev&apos;s paymaster
                      </a>{" "}
                      to sponsor all transaction fees. Your application pays
                      ZeroDev a monthly fee, and users get a completely gasless
                      experience.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Sponsored Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconRocket className="size-5" />
              Sponsored Transactions
            </CardTitle>
            <CardDescription>
              How gasless transactions work in this demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-are-sponsored">
                <AccordionTrigger>
                  What are sponsored transactions?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Sponsored transactions (also called gasless or
                    meta-transactions) allow users to interact with blockchain
                    applications without paying gas fees. Instead, a third party
                    in this case, your application covers the costs.
                  </p>
                  <div className="mt-3 rounded-lg bg-muted/50 p-4">
                    <p className="mb-2 font-semibold">Real-World Analogy:</p>
                    <p className="text-sm text-muted-foreground">
                      It&apos;s like a company providing employees with a
                      corporate credit card for business expenses. The company
                      (your application) pays the bill, while employees (users)
                      get the benefit without out-of-pocket costs or
                      reimbursement hassles.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-demo-works">
                <AccordionTrigger>
                  How does gas sponsorship work in this demo?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>This demo uses ZeroDev&apos;s infrastructure:</p>
                  <ol className="ml-4 list-decimal space-y-3 text-sm">
                    <li>
                      <strong>User initiates a transaction</strong> from the
                      Send ETH form
                    </li>
                    <li>
                      <strong>Frontend sends request</strong> to our Next.js API
                      route
                    </li>
                    <li>
                      <strong>Backend creates a ZeroDev Kernel client</strong>{" "}
                      with gas sponsorship enabled
                    </li>
                    <li>
                      <strong>ZeroDev&apos;s paymaster</strong> approves and
                      sponsors the gas fee
                    </li>
                    <li>
                      <strong>Transaction executes</strong> on Base Sepolia
                      testnet without the user paying gas
                    </li>
                    <li>
                      <strong>User sees success</strong> message with
                      transaction hash
                    </li>
                  </ol>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Technical implementation:{" "}
                    <code className="rounded bg-muted px-1 py-0.5">
                      src/services/zerodev.service.ts
                    </code>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cost-control">
                <AccordionTrigger>
                  How do you control sponsorship costs?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    ZeroDev provides granular controls called{" "}
                    <a
                      href="https://docs.zerodev.app/meta-infra/gas-policies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      &quot;Gas Policies&quot;
                    </a>{" "}
                    to manage costs:
                  </p>
                  <ul className="ml-4 list-disc space-y-2 text-sm">
                    <li>
                      <strong>Rate limiting:</strong> &quot;Sponsor up to 100
                      transactions per minute&quot;
                    </li>
                    <li>
                      <strong>Spending caps:</strong> &quot;Sponsor up to $5 in
                      gas costs per user per day&quot;
                    </li>
                    <li>
                      <strong>Allowlist contracts:</strong> Only sponsor
                      interactions with specific smart contracts
                    </li>
                    <li>
                      <strong>User-level limits:</strong> Different limits for
                      free vs. premium users
                    </li>
                  </ul>
                  <div className="mt-3 rounded-lg border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Pricing Model:</strong> You pay ZeroDev monthly
                      based on usage (similar to AWS or Stripe). You can then
                      pass costs to users via subscriptions, ads, or absorb as
                      customer acquisition cost just like any SaaS business.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger>
                  Is gas sponsorship secure? Can it be abused?
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>
                    Yes, it&apos;s secure. The Paymaster smart contract has full
                    control over what to sponsor:
                  </p>
                  <ul className="ml-4 list-disc space-y-2 text-sm">
                    <li>
                      Validates each transaction before sponsoring (signature
                      verification, rate limiting, allowlists)
                    </li>
                    <li>
                      Can reject transactions that don&apos;t meet criteria
                    </li>
                    <li>
                      ZeroDev provides DDoS protection and abuse detection
                    </li>
                    <li>You maintain gas policy controls to prevent abuse</li>
                  </ul>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Think of it like Stripe preventing credit card fraud the
                    infrastructure handles security, while you define business
                    rules.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Business Impact */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Bottom Line for Taylor&apos;s Team</CardTitle>
            <CardDescription>
              Why this technology matters for your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-semibold">Eliminate Onboarding Friction</p>
                  <p className="text-sm text-muted-foreground">
                    Users start using your blockchain app in seconds without
                    buying ETH, understanding gas fees, or managing seed
                    phrases. It works like any other app they already use.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-semibold">Improve Conversion Rates</p>
                  <p className="text-sm text-muted-foreground">
                    Users don&apos;t abandon transactions due to gas fee
                    confusion or insufficient ETH. Trust Wallet has sponsored
                    over $100M in swap volume, demonstrating massive user
                    adoption when friction is removed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-semibold">
                    Predictable Infrastructure Costs
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You control what to sponsor and can manage costs like any
                    other infrastructure (AWS, Stripe, etc.). Treat it as
                    customer acquisition cost or pass it to users via
                    subscriptions.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-semibold">Competitive Differentiation</p>
                  <p className="text-sm text-muted-foreground">
                    While competitors still require users to manage gas fees and
                    understand crypto, you offer a seamless Web2-like experience
                    making your product significantly more accessible to
                    mainstream users.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-primary/20 bg-background p-4">
              <p className="text-sm">
                <strong>This demo proves</strong> that blockchain applications
                can deliver the same smooth user experience as traditional web
                apps. Your users don&apos;t need to understand the underlying
                technology they just use it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
