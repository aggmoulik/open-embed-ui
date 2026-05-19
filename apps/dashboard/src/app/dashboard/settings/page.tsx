'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
import { ConfirmDialog } from '@open-embed-ui/ui/components/confirm-dialog';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks';
import { deleteAccount } from '@/lib/api-client';
import { authClient } from '@/lib/auth-client';
import { PageHeader } from '@/components/page-header';
import { Section, Field, TextInput, InfoRow } from '@/components/section';

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

  async function handleSaveProfile() {
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
  }

  async function handleDeleteAccount() {
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
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[760px] space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        num="04"
        eyebrow="settings"
        title="Account & profile."
        lead="Edit your display name, change your avatar, or deactivate your account."
      />

      <div className="space-y-4">
        <Section title="profile">
          <div className="mb-5 flex items-center gap-4">
            {image ? (
              <img
                src={image}
                alt={name}
                className="border-border size-16 rounded-full border-2 object-cover"
              />
            ) : (
              <div className="bg-muted border-border text-muted-foreground flex size-16 items-center justify-center rounded-full border-2 font-mono text-xl font-bold">
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1">
              <Field label="Avatar URL">
                <TextInput
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </Field>
            </div>
          </div>

          <Field label="Display name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </Field>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving || !name.trim()}
            className="border-foreground bg-foreground text-background hover:bg-foreground/90 mt-4 inline-flex h-[34px] items-center gap-2 rounded-md border px-4 font-mono text-[12px] font-medium transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </Section>

        <Section title="account" padded={false}>
          <InfoRow label="Email" value={profile?.email ?? '—'} />
          <InfoRow
            label="GitHub"
            value={
              profile?.githubUsername ? (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-brand underline-offset-2 transition-colors hover:underline"
                >
                  @{profile.githubUsername}
                </a>
              ) : (
                <span className="text-muted-foreground/70">not connected</span>
              )
            }
          />
          <InfoRow
            label="Member since"
            value={<span className="text-muted-foreground/90">{memberSince}</span>}
            isLast
          />
        </Section>

        <section className="border-destructive/40 bg-destructive/5 overflow-hidden rounded-xl border">
          <div className="border-destructive/30 flex items-center justify-between border-b border-dashed px-4 py-2">
            <span className="text-destructive font-mono text-[10px] uppercase tracking-[0.08em]">
              // danger zone
            </span>
            <span className="text-destructive/80 font-mono text-[10px] uppercase tracking-[0.08em]">
              irreversible
            </span>
          </div>
          <div className="p-4">
            <p className="text-muted-foreground mb-4 text-[14px] leading-[1.55]">
              Deactivating your account hides all your widgets, contributions, and embeds.
              Contributions stay in the database for 30 days under your anonymized record before
              permanent deletion. Contact support during that window to recover.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/20 inline-flex h-[34px] items-center gap-2 rounded-md border px-4 font-mono text-[12px] font-medium transition-colors disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deactivating…
                </>
              ) : (
                'Deactivate account'
              )}
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Deactivate account"
        description="This will deactivate your account and hide all your widgets and data. Are you sure you want to proceed?"
        confirmLabel={deleting ? 'Deactivating…' : 'Deactivate account'}
        destructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
