'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@open-embed-ui/ui/components/button';
import { Input } from '@open-embed-ui/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@open-embed-ui/ui/components/card';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
import { ArrowLeft, Save, Loader2, Check, Code, Eye } from 'lucide-react';
import { useWidget, useContributions, useIsAdmin } from '@/hooks';
import { createWidget } from '@/lib/api-client';
import { EmbedCodeModal } from '@/components/embed-code-modal';
import { PreviewModal } from '@/components/preview-modal';
import { toast } from 'sonner';
import { isValidOriginEntry } from '@/lib/db';
import { LAYOUTS } from '@/lib/layouts';
import type { WidgetConfig } from '@/types';

export default function WidgetBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';
  const isAdmin = useIsAdmin();

  const { data: widget, loading: widgetLoading, update } = useWidget(isNew ? null : params.id);
  const { data: allContributions } = useContributions();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<WidgetConfig>({
    theme: 'system',
    layout: 'grid',
    timeRange: 'all',
    maxItems: 10,
  });
  // Origin allowlist — multi-line input, one entry per line. Empty
  // string = unrestricted (mapped to null on save).
  const [allowedOriginsText, setAllowedOriginsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (widget) {
      setName(widget.name);
      setDescription(widget.description ?? '');
      setConfig(
        widget.config ?? { theme: 'system', layout: 'grid', timeRange: 'all', maxItems: 10 },
      );
      setAllowedOriginsText((widget.allowedOrigins ?? []).join('\n'));
    }
  }, [widget]);

  // Live validation of the textarea — invalid lines highlighted before save.
  const originLines = useMemo(
    () =>
      allowedOriginsText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [allowedOriginsText],
  );
  const invalidOrigins = useMemo(
    () => originLines.filter((s) => !isValidOriginEntry(s)),
    [originLines],
  );
  const hasOriginErrors = invalidOrigins.length > 0;

  const repos = useMemo(() => {
    const set = new Set(allContributions.map((c) => c.repo));
    return Array.from(set).sort();
  }, [allContributions]);

  // All PRs sorted by merge date
  const allSortedPRs = useMemo(() => {
    return [...allContributions].sort((a, b) => {
      const aTime = a.mergedAt ? new Date(a.mergedAt).getTime() : 0;
      const bTime = b.mergedAt ? new Date(b.mergedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [allContributions]);

  // PR selector list — filtered by repo badges (for browsing/selecting)
  const candidatePRs = useMemo(() => {
    if (!config.repos || config.repos.length === 0) return allSortedPRs;
    return allSortedPRs.filter((c) => config.repos!.includes(c.repo));
  }, [allSortedPRs, config.repos]);

  // Preview — shows selected PRs from ALL repos (repo filter doesn't affect this)
  const filteredContributions = useMemo(() => {
    let result = allSortedPRs;

    if (config.selectedPRs) {
      const selectedSet = new Set(config.selectedPRs);
      result = result.filter((c) => selectedSet.has(c.id));
    }

    if (config.maxItems) {
      result = result.slice(0, config.maxItems);
    }

    return result;
  }, [allSortedPRs, config.selectedPRs, config.maxItems]);

  function isPRSelected(prId: string) {
    if (!config.selectedPRs) return true;
    return config.selectedPRs.includes(prId);
  }

  function toggleRepo(repo: string) {
    setConfig((prev) => {
      const current = prev.repos ?? [];
      const next = current.includes(repo) ? current.filter((r) => r !== repo) : [...current, repo];
      return { ...prev, repos: next.length > 0 ? next : undefined };
    });
  }

  function togglePR(prId: string) {
    setConfig((prev) => {
      if (!prev.selectedPRs) {
        // All are selected → uncheck this one = all PRs except this one
        const allIds = allSortedPRs.map((c) => c.id).filter((id) => id !== prId);
        return { ...prev, selectedPRs: allIds };
      }
      const current = prev.selectedPRs;
      const next = current.includes(prId)
        ? current.filter((id) => id !== prId)
        : [...current, prId];
      // If all re-selected, go back to undefined (= all)
      if (next.length === allSortedPRs.length) {
        return { ...prev, selectedPRs: undefined };
      }
      return { ...prev, selectedPRs: next };
    });
  }

  async function handleSave() {
    if (!name.trim()) return;
    if (hasOriginErrors) {
      toast.error(`Fix invalid origin(s): ${invalidOrigins.join(', ')}`);
      return;
    }
    if (originLines.length === 0) {
      toast.error('Add at least one allowed origin to publish this widget');
      return;
    }
    setSaving(true);
    try {
      const allowedOrigins = originLines;

      if (isNew) {
        const res = await createWidget({
          name: name.trim(),
          description: description.trim() || undefined,
          config,
          allowedOrigins,
        });
        toast.success('Widget created');
        router.push(`/dashboard/widgets/${res.data.id}`);
      } else {
        await update({
          name: name.trim(),
          description: description.trim() || undefined,
          config,
          allowedOrigins,
        });
        toast.success('Widget updated');
      }
    } catch {
      toast.error('Failed to update widget');
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && widgetLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const selectedInView = candidatePRs.filter((c) => isPRSelected(c.id)).length;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/widgets')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">{isNew ? 'New Widget' : 'Edit Widget'}</h1>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowEmbed(true)}
            >
              <Code className="size-3.5" />
              Embed
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saving ? 'Updating...' : isNew ? 'Create' : 'Update'}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        {/* Config Panel (left) */}
        <div className="w-full shrink-0 space-y-3 lg:w-60">
          <Card>
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pt-0 pb-3">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="My Widget"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Optional description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">Layout</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pt-0 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {LAYOUTS.filter(
                  // Show featured layouts to everyone; admins see all 12;
                  // also keep the currently-selected layout visible so
                  // existing widgets using a non-featured layout don't
                  // appear broken in the picker.
                  (l) => l.featured || isAdmin || l.value === config.layout,
                ).map((l) => (
                  <Button
                    key={l.value}
                    variant={config.layout === l.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => setConfig((prev) => ({ ...prev, layout: l.value }))}
                    title={
                      !l.featured && isAdmin
                        ? 'Admin-only layout (not shown to regular users)'
                        : undefined
                    }
                  >
                    <l.icon className="size-3" />
                    {l.label}
                    {!l.featured && isAdmin && (
                      <span className="ml-0.5 rounded bg-amber-500/15 px-1 text-[9px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                        dev
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">Max Items</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pt-0 pb-3">
              <Input
                type="number"
                min={1}
                value={config.maxItems ?? ''}
                placeholder="10"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfig((prev) => ({
                    ...prev,
                    maxItems:
                      e.target.value === '' ? undefined : Math.max(1, Number(e.target.value)),
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 py-2 pb-1">
              <CardTitle className="text-sm">
                Allowed Origins <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pt-0 pb-3">
              <p className="text-muted-foreground text-[11px] leading-snug">
                Required. The widget only renders on these origins; everywhere else gets a 403. One
                per line. Examples:
                <br />
                <code className="text-[10px]">https://example.com</code>
                <br />
                <code className="text-[10px]">*.example.com</code>
                <br />
                <code className="text-[10px]">http://localhost:*</code>
              </p>
              <textarea
                value={allowedOriginsText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setAllowedOriginsText(e.target.value)
                }
                placeholder="https://yoursite.com"
                rows={4}
                className={`w-full rounded-md border bg-transparent px-2 py-1.5 font-mono text-xs outline-none ${
                  hasOriginErrors || originLines.length === 0
                    ? 'border-destructive focus:ring-destructive/20 focus:ring-2'
                    : 'border-input focus:ring-ring/20 focus:ring-2'
                }`}
              />
              {hasOriginErrors ? (
                <p className="text-destructive text-[11px]">
                  Invalid: {invalidOrigins.slice(0, 3).join(', ')}
                  {invalidOrigins.length > 3 ? ` +${invalidOrigins.length - 3}` : ''}
                </p>
              ) : originLines.length > 0 ? (
                <p className="text-muted-foreground text-[11px]">
                  {originLines.length} origin{originLines.length === 1 ? '' : 's'} allowed
                </p>
              ) : (
                <p className="text-destructive text-[11px]">Required — add at least one origin</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center: Repo Filter + PR Selector + Preview */}
        <div className="min-w-0 flex-1">
          {/* Repo filter badges */}
          {repos.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-muted-foreground text-sm font-medium">Filter by Repo</h2>
                {config.repos && config.repos.length > 0 && (
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, repos: undefined }))}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {repos.map((repo) => {
                  const selected = !config.repos || config.repos.includes(repo);
                  const avatarUrl = `https://github.com/${repo.split('/')[0]}.png?size=32`;
                  return (
                    <button
                      key={repo}
                      onClick={() => toggleRepo(repo)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        selected
                          ? 'border-primary/30 bg-primary/10 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt=""
                        className="size-3.5 rounded-full"
                        loading="lazy"
                      />
                      {repo}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PR Selector */}
          {candidatePRs.length > 0 && (
            <div className="mb-6">
              <h2 className="text-muted-foreground mb-2 text-sm font-medium">
                Select PRs ({selectedInView}/{candidatePRs.length})
              </h2>
              <div className="max-h-[calc(100vh-300px)] space-y-1.5 overflow-y-auto rounded-lg border p-3">
                {candidatePRs.map((pr) => {
                  const selected = isPRSelected(pr.id);
                  const displayTitle = config.titleOverrides?.[pr.id] || pr.title;
                  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=32`;

                  return (
                    <div
                      key={pr.id}
                      className={`group flex items-start gap-2.5 rounded-md border p-2.5 transition-colors ${
                        selected
                          ? 'border-primary/20 bg-primary/5'
                          : 'bg-muted/30 border-transparent opacity-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => togglePR(pr.id)}
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        }`}
                      >
                        {selected && <Check className="size-3" />}
                      </button>

                      {/* PR info */}
                      <div className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-xs font-medium">{displayTitle}</span>
                        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[10px]">
                          <span className="flex items-center gap-1">
                            <img
                              src={avatarUrl}
                              alt=""
                              className="size-3.5 rounded-full"
                              loading="lazy"
                            />
                            {pr.repo}
                          </span>
                          <span className="text-green-600">+{pr.additions}</span>
                          <span className="text-red-600">-{pr.deletions}</span>
                          {pr.mergedAt && (
                            <time dateTime={new Date(pr.mergedAt).toISOString()}>
                              {new Date(pr.mergedAt).toLocaleDateString()}
                            </time>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isNew && showEmbed && (
        <EmbedCodeModal widgetId={params.id} open={showEmbed} onClose={() => setShowEmbed(false)} />
      )}

      {showPreview && (
        <PreviewModal
          widgetId={params.id}
          open={showPreview}
          onClose={() => setShowPreview(false)}
          currentConfig={config}
          currentContributions={filteredContributions}
        />
      )}
    </div>
  );
}
