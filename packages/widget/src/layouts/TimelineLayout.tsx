import type { Contribution } from '../types';
import { safeHref, safeImgSrc } from '../lib/url-safe';
import { getDisplayLabels, getLabelColor } from '../labels';
import { getBlogTarget } from '../blog';
import { BLOG_ICON, PR_ICON_SM } from '../components/icons';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function TimelineLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  return (
    <div class="geu-timeline">
      <div class="geu-timeline-line" />
      {contributions.map((c) => {
        const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
        const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
        const labels = c.labels && c.labels.length > 0 ? getDisplayLabels(title, c.labels) : [];
        const blog = getBlogTarget(c);
        return (
          <div key={c.id} class="geu-timeline-item">
            <div class="geu-timeline-dot">{PR_ICON_SM}</div>
            <div class="geu-card-content">
              {labels.length > 0 && (
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
                <a href={safeHref(c.url)} target="_blank" rel="noopener noreferrer" class="geu-card-title">
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
                <a href={safeHref(`https://github.com/${c.repo}`)} target="_blank" rel="noopener noreferrer" class="geu-card-repo">
                  <img src={safeImgSrc(avatarUrl)} alt="" class="geu-card-avatar" loading="lazy" />
                  {c.repo}
                </a>
                <span class="geu-additions">+{c.additions}</span>
                <span class="geu-deletions">-{c.deletions}</span>
                {c.mergedAt && (
                  <time dateTime={c.mergedAt}>{new Date(c.mergedAt).toLocaleDateString()}</time>
                )}
              </div>
              {c.description && <p class="geu-card-desc">{c.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
