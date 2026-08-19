import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { demoConfig } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const { enabled } = demoConfig();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        {enabled && (
          <div className="space-y-3 rounded border border-border p-4">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
              JUST LOOKING?
            </p>
            <p className="text-sm text-muted-foreground">
              Open the demo with sample data — no sign-up, no email needed.
            </p>
            {demo === "unavailable" && (
              <p className="text-sm text-red-500">
                The demo is temporarily unavailable. Please sign in instead.
              </p>
            )}
            <Button asChild className="w-full">
              <Link href="/demo" prefetch={false}>
                View the live demo
              </Link>
            </Button>
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
