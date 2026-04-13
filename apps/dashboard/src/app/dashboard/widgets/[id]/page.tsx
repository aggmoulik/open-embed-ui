'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@github-embed-ui/ui/components/button';
import { Input } from '@github-embed-ui/ui/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@github-embed-ui/ui/components/card';
import { Badge } from '@github-embed-ui/ui/components/badge';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import {
  ArrowLeft,
  Save,
  Loader2,
  LayoutGrid,
  List,
  Clock,
  CreditCard,
  GalleryHorizontal,
  Presentation,
  LayoutDashboard,
  Star,
  Receipt,
  ScrollText,
  Trophy,
  TerminalSquare,
  GitBranch,
  Award,
  Check,
  X,
  Pencil,
  Code,
  Eye,
} from 'lucide-react';
import { useWidget, useContributions } from '@/hooks';
import { createWidget } from '@/lib/api-client';
import { EmbedCodeModal } from '@/components/embed-code-modal';
import { PreviewModal } from '@/components/preview-modal';
import { toast } from 'sonner';
import type { WidgetConfig, Contribution } from '@/types';

const LAYOUTS = [
  { value: 'grid' as const, label: 'Grid', icon: LayoutGrid },
  { value: 'list' as const, label: 'List', icon: List },
  { value: 'timeline' as const, label: 'Timeline', icon: Clock },
  { value: 'single-card' as const, label: 'Single Card', icon: CreditCard },
  { value: 'marquee' as const, label: 'Marquee', icon: GalleryHorizontal },
  { value: 'carousel' as const, label: 'Carousel', icon: Presentation },
  { value: 'masonry' as const, label: 'Masonry', icon: LayoutDashboard },
  { value: 'highlight' as const, label: 'Highlight', icon: Star },
  { value: 'terminal' as const, label: 'Receipt', icon: Receipt },
  { value: 'log' as const, label: 'Log', icon: ScrollText },
  { value: 'scorecard' as const, label: 'Scorecard', icon: Trophy },
  { value: 'gitlog' as const, label: 'Git Log', icon: TerminalSquare },
  { value: 'devlog' as const, label: 'Dev Log', icon: GitBranch },
  { value: 'proof' as const, label: 'Proof of Work', icon: Award },
];

const TIME_RANGES = ['week', 'month', 'year', 'all'] as const;

export default function WidgetBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';

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
  const [saving, setSaving] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  useEffect(() => {
    if (widget) {
      setName(widget.name);
      setDescription(widget.description ?? '');
      setConfig(
        widget.config ?? { theme: 'system', layout: 'grid', timeRange: 'all', maxItems: 10 },
      );
    }
  }, [widget]);

  const repos = useMemo(() => {
    const set = new Set(allContributions.map((c) => c.repo));
    return Array.from(set).sort();
  }, [allContributions]);

  // All PRs sorted by date (time range applied)
  const allSortedPRs = useMemo(() => {
    let result: Contribution[] = [...allContributions];

    if (config.timeRange && config.timeRange !== 'all') {
      const now = Date.now();
      const ranges = { week: 7, month: 30, year: 365 };
      const days = ranges[config.timeRange];
      const since = now - days * 24 * 60 * 60 * 1000;
      result = result.filter((c) => c.mergedAt && new Date(c.mergedAt).getTime() > since);
    }

    result.sort((a, b) => {
      const aTime = a.mergedAt ? new Date(a.mergedAt).getTime() : 0;
      const bTime = b.mergedAt ? new Date(b.mergedAt).getTime() : 0;
      return bTime - aTime;
    });

    return result;
  }, [allContributions, config.timeRange]);

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

  function startEditTitle(prId: string, currentTitle: string) {
    setEditingTitle(prId);
    setEditTitleValue(config.titleOverrides?.[prId] ?? currentTitle);
  }

  function saveTitle(prId: string) {
    setConfig((prev) => {
      const overrides = { ...(prev.titleOverrides ?? {}) };
      const original = allContributions.find((c) => c.id === prId)?.title ?? '';
      if (editTitleValue.trim() && editTitleValue.trim() !== original) {
        overrides[prId] = editTitleValue.trim();
      } else {
        delete overrides[prId];
      }
      return { ...prev, titleOverrides: Object.keys(overrides).length > 0 ? overrides : undefined };
    });
    setEditingTitle(null);
  }

  function cancelEditTitle() {
    setEditingTitle(null);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await createWidget({
          name: name.trim(),
          description: description.trim() || undefined,
          config,
        });
        toast.success('Widget created');
        router.push(`/dashboard/widgets/${res.data.id}`);
      } else {
        await update({ name: name.trim(), description: description.trim() || undefined, config });
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

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Config Panel (left) */}
        <div className="w-full shrink-0 space-y-4 lg:w-64">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
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
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Layout</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-4 gap-2">
                {LAYOUTS.map((l) => (
                  <Button
                    key={l.value}
                    variant={config.layout === l.value ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setConfig((prev) => ({ ...prev, layout: l.value }))}
                  >
                    <l.icon className="size-3" />
                    {l.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Time Range</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {TIME_RANGES.map((t) => (
                  <Button
                    key={t}
                    variant={config.timeRange === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfig((prev) => ({ ...prev, timeRange: t }))}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Max Items</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
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
                  const hasOverride = !!config.titleOverrides?.[pr.id];
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
                        {editingTitle === pr.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editTitleValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setEditTitleValue(e.target.value)
                              }
                              className="h-7 text-xs"
                              autoFocus
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') saveTitle(pr.id);
                                if (e.key === 'Escape') cancelEditTitle();
                              }}
                            />
                            <Button variant="ghost" size="icon-xs" onClick={() => saveTitle(pr.id)}>
                              <Check className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon-xs" onClick={cancelEditTitle}>
                              <X className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="line-clamp-1 text-xs font-medium">{displayTitle}</span>
                            <button
                              onClick={() => startEditTitle(pr.id, pr.title)}
                              title="Edit title"
                              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Pencil className="text-muted-foreground hover:text-foreground size-3" />
                            </button>
                            {hasOverride && (
                              <Badge variant="outline" className="px-1 py-0 text-[9px]">
                                edited
                              </Badge>
                            )}
                          </div>
                        )}
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
