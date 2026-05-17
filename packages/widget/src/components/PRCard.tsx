import type { Contribution } from '../types';
import { safeHref, safeImgSrc } from '../lib/url-safe';
import { getDisplayLabels, getLabelColor } from '../labels';
import { getBlogTarget } from '../blog';
import { BLOG_ICON, PR_ICON } from './icons';

interface PRCardProps {
  contribution: Contribution;
  titleOverride?: string;
  compact?: boolean;
  /** When false, suppress description even if present. Defaults to true. */
  showDescription?: boolean;
  /** When false, suppress label badges even if user-set. Defaults to true. */
  showLabels?: boolean;
  /**
   * Reserve fixed vertical space for optional fields (badge row + description)
   * even when absent, so every card in a row has identical height and inner
   * elements align across cards. Used by marquee to avoid jagged rows. Also
   * makes the card stretch to fill its flex parent (`geu-card-uniform`
   * class adds h-full).
   */
  uniform?: boolean;
}

export function PRCard({
  contribution,
  titleOverride,
  compact,
  showDescription = true,
  showLabels = true,
  uniform = false,
}: PRCardProps) {
  const c = contribution;
  const title = c.titleOverride || titleOverride || c.title;
  const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
  // Only render labels in card layouts when the user has explicitly set them.
  // Receipt-family layouts handle the auto-detect fallback themselves.
  const labels = showLabels && c.labels && c.labels.length > 0 ? getDisplayLabels(title, c.labels) : [];
  const blog = getBlogTarget(c);

  return (
    <div class={`geu-card ${uniform ? 'geu-card-uniform' : ''}`}>
      <span class="geu-card-icon">{PR_ICON}</span>
      <div class="geu-card-content">
        {(labels.length > 0 || uniform) && (
          <div class="geu-card-badges">
            {labels.map((label) => {
              const color = getLabelColor(label);
              return (
                <span
                  key={label}
                  class="geu-card-badge"
                  data-lbl
                  style={`--lbl-light:${color.light};--lbl-dark:${color.dark}`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
        <div class="geu-card-title-row">
          <a
            href={safeHref(c.url)}
            target="_blank"
            rel="noopener noreferrer"
            class={`geu-card-title ${compact ? 'geu-card-title-compact' : ''}`}
          >
            {title}
          </a>
          {blog && (
            <a
              href={safeHref(blog.href)}
              target={blog.target}
              rel={blog.rel}
              class="geu-card-blog"
              aria-label="Read blog post"
              title="Read blog post"
            >
              {BLOG_ICON}
            </a>
          )}
        </div>
        <div class="geu-card-meta">
          <a
            href={safeHref(`https://github.com/${c.repo}`)}
            target="_blank"
            rel="noopener noreferrer"
            class="geu-card-repo"
          >
            <img src={safeImgSrc(avatarUrl)} alt="" class="geu-card-avatar" loading="lazy" />
            {c.repo}
          </a>
          <span class="geu-additions">+{c.additions}</span>
          <span class="geu-deletions">-{c.deletions}</span>
          {c.mergedAt && (
            <time dateTime={c.mergedAt}>
              {new Date(c.mergedAt).toLocaleDateString()}
            </time>
          )}
        </div>
        {showDescription && (c.description || uniform) && (
          <p class="geu-card-desc">{c.description ?? ' '}</p>
        )}
      </div>
    </div>
  );
}
