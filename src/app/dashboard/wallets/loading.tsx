import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconWallet } from "@tabler/icons-react";

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconWallet className="size-5" />
          Your Wallet
        </CardTitle>
        <CardDescription>Loading your pre-generated wallet...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </CardContent>
    </Card>
  );
}
