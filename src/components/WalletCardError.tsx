import { IconAlertCircle } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";

export const WalletCardError = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <IconAlertCircle className="size-5" />
          Error
        </CardTitle>
        <CardDescription>props</CardDescription>
      </CardHeader>
    </Card>
  );
};
