/**
 * Inline SVG icons — replacements for lucide-react usages in the shared
 * widget-components package. The shared package can't depend on lucide-react
 * because it has a React peer dep that doesn't cleanly survive the
 * preact/compat alias at widget build time.
 *
 * Each icon below mirrors its lucide-react counterpart byte-for-byte from
 * lucide.dev (24x24 viewBox, 2px stroke).
 */

type IconProps = {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
};

/** lucide: GitPullRequest */
export function GitPullRequest({ className, size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" x2="6" y1="9" y2="21" />
    </svg>
  );
}

/** lucide: BookOpen */
export function BookOpen({ className, size = 16, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
