import { PRCard } from '../components/PRCard';
import type { Contribution } from '../types';

const PR_ICON = (
  <svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
  </svg>
);

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function HighlightLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  const featured = contributions[0];
  const featuredTitle = titleOverrides?.[featured.id] || featured.title;
  const avatarUrl = `https://github.com/${featured.repoOwner}.png?size=48`;

  return (
    <div class="geu-highlight">
      <div class="geu-highlight-featured">
        <div class="geu-highlight-icon">{PR_ICON}</div>
        <div class="geu-card-content">
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            class="geu-card-title geu-card-title-large"
          >
            {featuredTitle}
          </a>
          <div class="geu-card-meta" style={{ fontSize: '13px', marginTop: '6px' }}>
            <a
              href={`https://github.com/${featured.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              class="geu-card-repo"
            >
              <img src={avatarUrl} alt="" class="geu-card-avatar geu-card-avatar-large" loading="lazy" />
              {featured.repo}
            </a>
            <span class="geu-additions">+{featured.additions}</span>
            <span class="geu-deletions">-{featured.deletions}</span>
            <span>{featured.changedFiles} files</span>
          </div>
          {featured.mergedAt && (
            <div class="geu-single-date">
              Merged on{' '}
              <time dateTime={featured.mergedAt}>
                {new Date(featured.mergedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          )}
        </div>
      </div>
      {contributions.length > 1 && (
        <div class="geu-highlight-secondary">
          {contributions.slice(1, 3).map((c) => (
            <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
