import type { Contribution } from '../types';
import { safeHref, safeImgSrc } from '../lib/url-safe';

const PR_ICON = (
  <svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
  </svg>
);

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function SingleCardLayout({ contributions, titleOverrides }: Props) {
  const pr = contributions[0];
  if (!pr) return <div class="geu-empty">No contributions to display</div>;

  const title = pr.titleOverride || titleOverrides?.[pr.id] || pr.title;
  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=48`;

  return (
    <div class="geu-single">
      <div class="geu-single-icon">{PR_ICON}</div>
      <div class="geu-card-content">
        <a href={safeHref(pr.url)} target="_blank" rel="noopener noreferrer" class="geu-card-title geu-card-title-large">
          {title}
        </a>
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
      </div>
    </div>
  );
}
