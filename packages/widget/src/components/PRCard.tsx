import type { Contribution } from '../types';

const PR_ICON = (
  <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
  </svg>
);

interface PRCardProps {
  contribution: Contribution;
  titleOverride?: string;
  compact?: boolean;
}

export function PRCard({ contribution, titleOverride, compact }: PRCardProps) {
  const title = contribution.titleOverride || titleOverride || contribution.title;
  const avatarUrl = `https://github.com/${contribution.repoOwner}.png?size=32`;

  return (
    <div class="geu-card">
      <span class="geu-card-icon">{PR_ICON}</span>
      <div class="geu-card-content">
        <a
          href={contribution.url}
          target="_blank"
          rel="noopener noreferrer"
          class={`geu-card-title ${compact ? 'geu-card-title-compact' : ''}`}
        >
          {title}
        </a>
        <div class="geu-card-meta">
          <a
            href={`https://github.com/${contribution.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            class="geu-card-repo"
          >
            <img src={avatarUrl} alt="" class="geu-card-avatar" loading="lazy" />
            {contribution.repo}
          </a>
          <span class="geu-additions">+{contribution.additions}</span>
          <span class="geu-deletions">-{contribution.deletions}</span>
          {contribution.mergedAt && (
            <time dateTime={contribution.mergedAt}>
              {new Date(contribution.mergedAt).toLocaleDateString()}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}
