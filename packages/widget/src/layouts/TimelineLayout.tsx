import type { Contribution } from '../types';

const PR_ICON_SM = (
  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
  </svg>
);

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
        const title = titleOverrides?.[c.id] || c.title;
        const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
        return (
          <div key={c.id} class="geu-timeline-item">
            <div class="geu-timeline-dot">{PR_ICON_SM}</div>
            <div class="geu-card-content">
              <a href={c.url} target="_blank" rel="noopener noreferrer" class="geu-card-title">
                {title}
              </a>
              <div class="geu-card-meta">
                <a href={`https://github.com/${c.repo}`} target="_blank" rel="noopener noreferrer" class="geu-card-repo">
                  <img src={avatarUrl} alt="" class="geu-card-avatar" loading="lazy" />
                  {c.repo}
                </a>
                <span class="geu-additions">+{c.additions}</span>
                <span class="geu-deletions">-{c.deletions}</span>
                {c.mergedAt && (
                  <time dateTime={c.mergedAt}>{new Date(c.mergedAt).toLocaleDateString()}</time>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
