'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@github-embed-ui/ui/components/card';
import { Button } from '@github-embed-ui/ui/components/button';
import { Input } from '@github-embed-ui/ui/components/input';
import { Separator } from '@github-embed-ui/ui/components/separator';
import { Badge } from '@github-embed-ui/ui/components/badge';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import { ConfirmDialog } from '@github-embed-ui/ui/components/confirm-dialog';
import { useProfile } from '@/hooks';
import { deleteAccount } from '@/lib/api-client';
import { authClient } from '@/lib/auth-client';

export default function SettingsPage() {
  const { data: profile, loading, update } = useProfile();
  const router = useRouter();

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [nameInitialized, setNameInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form fields when profile loads
  if (profile && !nameInitialized) {
    setName(profile.name ?? '');
    setImage(profile.image ?? '');
    setNameInitialized(true);
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      await update({ name: name.trim(), image: image.trim() || undefined });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await authClient.signOut();
      toast.success('Account deactivated');
      router.push('/login');
    } catch {
      toast.error('Failed to deactivate account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {image ? (
              <img
                src={image}
                alt={name}
                className="border-border size-16 rounded-full border-2 object-cover"
              />
            ) : (
              <div className="bg-muted border-border flex size-16 items-center justify-center rounded-full border-2 text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Email</span>
            <span className="text-sm">{profile?.email}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">GitHub</span>
            {profile?.githubUsername ? (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline"
              >
                @{profile.githubUsername}
              </a>
            ) : (
              <Badge variant="secondary">Not connected</Badge>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Member since</span>
            <span className="text-sm">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            This will deactivate your account and hide all your widgets, contributions, and embeds.
            Contact support to recover your account.
          </p>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Deactivate Account
          </Button>
          <ConfirmDialog
            open={showDeleteConfirm}
            title="Deactivate Account"
            description="This will deactivate your account and hide all your widgets and data. Are you sure you want to proceed?"
            confirmLabel={deleting ? 'Deactivating...' : 'Deactivate Account'}
            destructive
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
