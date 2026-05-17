import type { Contribution } from '../types';
import { safeHref, safeImgSrc } from '../lib/url-safe';
import { getDisplayLabels, getLabelColor } from '../labels';
import { getBlogTarget } from '../blog';
import { BLOG_ICON, PR_ICON_LG as PR_ICON } from '../components/icons';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function SingleCardLayout({ contributions, titleOverrides }: Props) {
  const pr = contributions[0];
  if (!pr) return <div class="geu-empty">No contributions to display</div>;

  const title = pr.titleOverride || titleOverrides?.[pr.id] || pr.title;
  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=48`;
  const labels = pr.labels && pr.labels.length > 0 ? getDisplayLabels(title, pr.labels) : [];
  const blog = getBlogTarget(pr);

  return (
    <div class="geu-single">
      <div class="geu-single-icon">{PR_ICON}</div>
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
          <a href={safeHref(pr.url)} target="_blank" rel="noopener noreferrer" class="geu-card-title geu-card-title-large">
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
        <div class="geu-card-meta" style={{ fontSize: '13px', marginTop: '6px' }}>
          <a href={safeHref(`https://github.com/${pr.repo}`)} target="_blank" rel="noopener noreferrer" class="geu-card-repo">
            <img src={safeImgSrc(avatarUrl)} alt="" class="geu-card-avatar geu-card-avatar-large" loading="lazy" />
            {pr.repo}
          </a>
          <span class="geu-additions">+{pr.additions}</span>
          <span class="geu-deletions">-{pr.deletions}</span>
          <span>{pr.changedFiles} files</span>
        </div>
        {pr.mergedAt && (
          <div class="geu-single-date">
            Merged on{' '}
            <time dateTime={pr.mergedAt}>
              {new Date(pr.mergedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        )}
        {pr.description && <p class="geu-card-desc">{pr.description}</p>}
      </div>
    </div>
  );
}
