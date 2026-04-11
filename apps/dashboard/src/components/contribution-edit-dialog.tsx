'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@github-embed-ui/ui/components/dialog';
import { Button } from '@github-embed-ui/ui/components/button';
import { Checkbox } from '@github-embed-ui/ui/components/checkbox';
import { Input } from '@github-embed-ui/ui/components/input';
import { Label } from '@github-embed-ui/ui/components/label';
import { Textarea } from '@github-embed-ui/ui/components/textarea';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Contribution } from '@/types';
import { useUpdateContribution } from '@/hooks';
import {
  BLOG_URL_MAX,
  DESCRIPTION_MAX,
  isSafeHttpUrl,
} from '@/lib/validation/contribution';

interface ContributionEditDialogProps {
  contribution: Contribution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Contribution) => void;
}

interface FormState {
  description: string;
  blogUrl: string;
  blogOpenInNewTab: boolean;
}

function toFormState(c: Contribution | null): FormState {
  return {
    description: c?.description ?? '',
    blogUrl: c?.blogUrl ?? '',
    // Default true for new rows and for rows imported before this column
    // existed (old rows return undefined from the API).
    blogOpenInNewTab: c?.blogOpenInNewTab !== false,
  };
}

/**
 * Modal editor for a single contribution's user-authored fields
 * (description, blog URL, blog open-in-new-tab). Plain text only — no
 * markdown.
 *
 * The dialog is controlled by the parent so the list can open/close it
 * imperatively. `onSaved` is called with the server-returned contribution
 * on a successful save; the parent uses that to refresh its local cache.
 */
export function ContributionEditDialog({
  contribution,
  open,
  onOpenChange,
  onSaved,
}: ContributionEditDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(contribution));
  const { save, saving, fieldErrors } = useUpdateContribution();

  // Reset the form whenever a different contribution is opened.
  useEffect(() => {
    setForm(toFormState(contribution));
  }, [contribution]);

  const initial = useMemo(() => toFormState(contribution), [contribution]);
  const dirty =
    form.description !== initial.description ||
    form.blogUrl !== initial.blogUrl ||
    form.blogOpenInNewTab !== initial.blogOpenInNewTab;

  // Client-side mirror of server validation — instant feedback. The server
  // is still the source of truth; any mismatch shows up via `fieldErrors`.
  const clientError = useMemo(() => {
    if (form.description.length > DESCRIPTION_MAX) {
      return { field: 'description', msg: `${DESCRIPTION_MAX} characters max` };
    }
    if (form.blogUrl) {
      if (form.blogUrl.length > BLOG_URL_MAX) {
        return { field: 'blogUrl', msg: `${BLOG_URL_MAX} characters max` };
      }
      if (!isSafeHttpUrl(form.blogUrl)) {
        return { field: 'blogUrl', msg: 'Must be a valid http or https URL' };
      }
    }
    return null;
  }, [form]);

  async function handleSave() {
    if (!contribution) return;
    if (clientError) return;

    const payload = {
      description: form.description.trim() ? form.description : null,
      blogUrl: form.blogUrl.trim() ? form.blogUrl : null,
      blogOpenInNewTab: form.blogOpenInNewTab,
    };

    const updated = await save(contribution.id, payload);
    if (updated) {
      toast.success('Contribution updated');
      onSaved(updated);
      onOpenChange(false);
    } else {
      toast.error('Failed to save contribution');
    }
  }

  const disabled = saving || !dirty || clientError !== null;
  const hasBlogUrl = form.blogUrl.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="line-clamp-1">
            {contribution?.title ?? 'Edit contribution'}
          </DialogTitle>
          <DialogDescription>
            {contribution?.repo ? (
              <a
                href={contribution.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {contribution.repo}
                <ExternalLink className="ml-1 inline size-3" />
              </a>
            ) : (
              'Add a short brief and blog link for this PR.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <span className="text-muted-foreground text-xs">
                {form.description.length} / {DESCRIPTION_MAX}
              </span>
            </div>
            <Textarea
              id="description"
              rows={3}
              placeholder="A short brief of what this PR did…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              aria-invalid={
                clientError?.field === 'description' || Boolean(fieldErrors?.description)
              }
            />
            {(clientError?.field === 'description' || fieldErrors?.description) && (
              <p className="text-destructive text-xs">
                {clientError?.field === 'description'
                  ? clientError.msg
                  : fieldErrors?.description}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="blogUrl">Blog URL</Label>
            <Input
              id="blogUrl"
              type="url"
              placeholder="https://…"
              value={form.blogUrl}
              onChange={(e) => setForm((f) => ({ ...f, blogUrl: e.target.value }))}
              aria-invalid={clientError?.field === 'blogUrl' || Boolean(fieldErrors?.blogUrl)}
            />
            {(clientError?.field === 'blogUrl' || fieldErrors?.blogUrl) && (
              <p className="text-destructive text-xs">
                {clientError?.field === 'blogUrl' ? clientError.msg : fieldErrors?.blogUrl}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <Checkbox
                id="blogOpenInNewTab"
                checked={form.blogOpenInNewTab}
                disabled={!hasBlogUrl}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, blogOpenInNewTab: checked === true }))
                }
              />
              <Label
                htmlFor="blogOpenInNewTab"
                className="text-muted-foreground cursor-pointer text-xs font-normal"
              >
                Open blog link in a new tab
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={disabled}>
            {saving && <Loader2 className="mr-1 size-3.5 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
