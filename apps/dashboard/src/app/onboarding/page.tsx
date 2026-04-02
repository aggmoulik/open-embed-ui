'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@github-embed-ui/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@github-embed-ui/ui/components/card';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to GitHub Embed UI!
          </CardTitle>
          <CardDescription>
            Create embeddable widgets that showcase your open-source
            contributions on any website.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What you can do:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Import your GitHub contributions</li>
              <li>Build custom embed widgets</li>
              <li>Share them on your portfolio or blog</li>
            </ul>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push('/dashboard/contributions')}
          >
            Import your contributions
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
