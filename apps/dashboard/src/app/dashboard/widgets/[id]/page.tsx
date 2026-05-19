'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
import { ArrowLeft, Save, Loader2, Check, Code, Eye } from 'lucide-react';
import { useWidget, useContributions, useIsAdmin } from '@/hooks';
import { createWidget } from '@/lib/api-client';
import { EmbedCodeModal } from '@/components/embed-code-modal';
import { PreviewModal } from '@/components/preview-modal';
import { toast } from 'sonner';
import { isValidOriginEntry } from '@/lib/db';
import { LAYOUTS } from '@/lib/layouts';
import { Section, Field, TextInput } from '@/components/section';
import { WidgetRenderer } from '@/components/widget-preview/widget-renderer';
import type { Contribution, WidgetConfig } from '@/types';

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

  const allSortedPRs = useMemo(() => {
    return [...allContributions].sort((a, b) => {
      const aTime = a.mergedAt ? new Date(a.mergedAt).getTime() : 0;
      const bTime = b.mergedAt ? new Date(b.mergedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [allContributions]);

  const candidatePRs = useMemo(() => {
    if (!config.repos || config.repos.length === 0) return allSortedPRs;
    return allSortedPRs.filter((c) => config.repos!.includes(c.repo));
  }, [allSortedPRs, config.repos]);

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
        const allIds = allSortedPRs.map((c) => c.id).filter((id) => id !== prId);
        return { ...prev, selectedPRs: allIds };
      }
      const current = prev.selectedPRs;
      const next = current.includes(prId)
        ? current.filter((id) => id !== prId)
        : [...current, prId];
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
      <div className="mx-auto max-w-[1240px] space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const selectedInView = candidatePRs.filter((c) => isPRSelected(c.id)).length;
  const stepNum = isNew ? '03' : '03';

  return (
    <div className="mx-auto max-w-[1240px]">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="marketing-section-eyebrow text-muted-foreground mb-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
            <button
              type="button"
              onClick={() => router.push('/dashboard/widgets')}
              aria-label="Back to widgets"
              className="border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex size-[22px] items-center justify-center rounded-md border transition-colors"
            >
              <ArrowLeft className="size-3" strokeWidth={2} />
            </button>
            <span>
              {stepNum} · {isNew ? 'new widget' : 'edit widget'}
            </span>
          </div>
          <h1 className="font-sans text-[32px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]">
            {isNew ? 'Build a new widget.' : name || 'Edit widget.'}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/40 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-[12px] transition-colors"
          >
            <Eye className="size-3.5" strokeWidth={1.75} />
            Preview
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => setShowEmbed(true)}
              className="border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/40 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-[12px] transition-colors"
            >
              <Code className="size-3.5" strokeWidth={1.75} />
              Embed code
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-[12px] font-medium transition-colors disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" strokeWidth={1.75} />
            )}
            {saving ? 'Saving…' : isNew ? 'Create' : 'Update'}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Config Panel (left) */}
        <div className="w-full shrink-0 space-y-3 lg:w-[280px]">
          <Section title="details">
            <Field label="Name">
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My widget"
              />
            </Field>
            <Field label="Description">
              <TextInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </Field>
          </Section>

          <Section title="layout">
            <div className="grid grid-cols-2 gap-1.5">
              {LAYOUTS.filter((l) => l.featured || isAdmin || l.value === config.layout).map(
                (l) => {
                  const active = config.layout === l.value;
                  const adminOnly = !l.featured && isAdmin;
                  return (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, layout: l.value }))}
                      title={
                        adminOnly ? 'Admin-only layout (not shown to regular users)' : undefined
                      }
                      className={`group relative flex items-center gap-1.5 rounded-md border px-2 py-2 text-left font-mono text-[11px] transition-colors ${
                        active
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      <l.icon className="size-3 shrink-0" strokeWidth={1.75} />
                      <span className="truncate">{l.label}</span>
                      {adminOnly && (
                        <span className="ml-auto rounded-sm bg-amber-500/15 px-1 text-[8px] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                          dev
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </Section>

          <Section title="max items">
            <TextInput
              type="number"
              min={1}
              value={config.maxItems ?? ''}
              placeholder="10"
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxItems: e.target.value === '' ? undefined : Math.max(1, Number(e.target.value)),
                }))
              }
            />
          </Section>

          <Section title="allowed origins" required>
            <p className="text-muted-foreground/80 mb-2 text-[11px] leading-[1.45]">
              Required. The widget only renders on these origins; everywhere else gets a 403. One
              per line.
            </p>
            <p className="text-muted-foreground/60 mb-2.5 font-mono text-[10px] leading-[1.6]">
              https://example.com
              <br />
              *.example.com
              <br />
              http://localhost:*
            </p>
            <textarea
              value={allowedOriginsText}
              onChange={(e) => setAllowedOriginsText(e.target.value)}
              placeholder="https://yoursite.com"
              rows={4}
              className={`bg-background w-full rounded-md border px-2.5 py-2 font-mono text-[12px] transition-shadow focus:ring-2 focus:outline-none ${
                hasOriginErrors || originLines.length === 0
                  ? 'border-destructive focus:ring-destructive/25'
                  : 'border-border focus:border-foreground focus:ring-brand/25'
              }`}
            />
            {hasOriginErrors ? (
              <p className="text-destructive mt-2 font-mono text-[11px]">
                <span className="font-semibold">// invalid: </span>
                {invalidOrigins.slice(0, 3).join(', ')}
                {invalidOrigins.length > 3 ? ` +${invalidOrigins.length - 3}` : ''}
              </p>
            ) : originLines.length > 0 ? (
              <p className="text-muted-foreground mt-2 font-mono text-[11px]">
                <span className="text-brand">●</span> {originLines.length} origin
                {originLines.length === 1 ? '' : 's'} allowed
              </p>
            ) : (
              <p className="text-destructive mt-2 font-mono text-[11px]">
                <span className="font-semibold">// required </span>— add at least one origin
              </p>
            )}
          </Section>
        </div>

        {/* Right: Repo filter + PR selector */}
        <div className="min-w-0 flex-1 space-y-3">
          {/*
            Inline live preview — implementation kept below in `LivePreview`
            for when we re-introduce it in a better location (drawer, modal
            overlay, or a separate /widgets/[id]/preview route). The modal
            Preview button still opens the full-screen preview today.
            <LivePreview
              contributions={filteredContributions}
              config={config}
              totalSelected={filteredContributions.length}
              totalAvailable={allSortedPRs.length}
            />
          */}

          {repos.length > 0 && (
            <Section title="filter by repo">
              <div className="flex flex-wrap items-center gap-1.5">
                {repos.map((repo) => {
                  const selected = !config.repos || config.repos.includes(repo);
                  const avatarUrl = `https://github.com/${repo.split('/')[0]}.png?size=32`;
                  return (
                    <button
                      key={repo}
                      type="button"
                      onClick={() => toggleRepo(repo)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors ${
                        selected
                          ? 'border-foreground bg-foreground/5 text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      {selected && (
                        <span
                          aria-hidden="true"
                          className="bg-brand size-1.5 rounded-full"
                          style={{
                            boxShadow:
                              '0 0 0 2px color-mix(in oklab, var(--brand) 18%, transparent)',
                          }}
                        />
                      )}
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
                {config.repos && config.repos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, repos: undefined }))}
                    className="text-muted-foreground/70 hover:text-foreground ml-1 font-mono text-[11px] underline-offset-2 transition-colors hover:underline"
                  >
                    clear
                  </button>
                )}
              </div>
            </Section>
          )}

          {candidatePRs.length > 0 && (
            <Section title={`select prs · ${selectedInView}/${candidatePRs.length}`} padded={false}>
              <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
                {candidatePRs.map((pr, i) => {
                  const selected = isPRSelected(pr.id);
                  const displayTitle = config.titleOverrides?.[pr.id] || pr.title;
                  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=32`;
                  const isLast = i === candidatePRs.length - 1;

                  return (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => togglePR(pr.id)}
                      className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                        isLast ? '' : 'border-border border-b border-dashed'
                      } ${
                        selected ? 'hover:bg-muted/40' : 'bg-muted/20 opacity-50 hover:opacity-80'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          selected
                            ? 'border-brand bg-brand text-white'
                            : 'border-muted-foreground/30 group-hover:border-muted-foreground/60'
                        }`}
                      >
                        {selected && <Check className="size-3" strokeWidth={2.5} />}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-[13px] font-medium">{displayTitle}</div>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <img
                              src={avatarUrl}
                              alt=""
                              className="size-3.5 rounded-full"
                              loading="lazy"
                            />
                            {pr.repo}
                          </span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-brand">+{pr.additions}</span>
                          <span className="text-danger">−{pr.deletions}</span>
                          {pr.mergedAt && (
                            <>
                              <span className="text-muted-foreground/60">·</span>
                              <time dateTime={new Date(pr.mergedAt).toISOString()}>
                                {new Date(pr.mergedAt).toLocaleDateString()}
                              </time>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {candidatePRs.length === 0 && (
            <div className="border-border bg-muted/20 text-muted-foreground rounded-xl border border-dashed py-12 text-center font-mono text-[13px]">
              <span className="text-brand">●</span> No contributions match the current filters.
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

// ─── Inline live preview ─────────────────────────────────────────────────────

interface LivePreviewProps {
  contributions: Contribution[];
  config: WidgetConfig;
  totalSelected: number;
  totalAvailable: number;
}

function LivePreview({ contributions, config, totalSelected, totalAvailable }: LivePreviewProps) {
  const layout = config.layout ?? 'grid';
  const theme = config.theme ?? 'system';

  return (
    <Section
      title="live preview"
      padded={false}
      trailing={
        <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.08em] uppercase">
          {totalSelected} / {totalAvailable} prs · {layout} · {theme}
        </span>
      }
    >
      {/* Browser-frame chrome — mirrors the landing WidgetDemo */}
      <div className="border-border bg-muted/40 flex items-center gap-3 border-b px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="bg-border size-2.5 rounded-full" />
          <span className="bg-border size-2.5 rounded-full" />
          <span className="bg-border size-2.5 rounded-full" />
        </div>
        <div className="border-border bg-background text-muted-foreground flex h-[26px] flex-1 items-center gap-0.5 rounded-md border px-2.5 font-mono text-[12px]">
          <span>https://</span>
          <b className="text-foreground font-semibold">your-portfolio.dev</b>
          <span>/now</span>
        </div>
        <span className="border-border bg-background text-foreground/80 rounded-[5px] border border-b-2 px-1.5 py-0.5 font-mono text-[11px]">
          live
        </span>
      </div>

      <div className="marketing-dot-bg bg-background min-h-[280px] p-6">
        {contributions.length > 0 ? (
          <WidgetRenderer contributions={contributions} config={config} />
        ) : (
          <div className="text-muted-foreground flex h-[220px] flex-col items-center justify-center gap-2 font-mono text-[12px]">
            <span className="text-brand">●</span>
            <span>Select at least one PR below to see the widget render.</span>
          </div>
        )}
      </div>
    </Section>
  );
}
