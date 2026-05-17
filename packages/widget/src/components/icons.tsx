// Shared inline icons. Single source so rollup can dedupe across layouts —
// the widget bundle has a 19 KB gz CI budget and inlining the same SVG in
// every layout pushes us over.

// Path string extracted as a const so multiple sizes share one string.
const PR_PATH =
  'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z';

function prIcon(size: number) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width={size} height={size}>
      <path d={PR_PATH} />
    </svg>
  );
}

export const PR_ICON_SM = prIcon(12);
export const PR_ICON = prIcon(16);
export const PR_ICON_LG = prIcon(20);

export const BLOG_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    width="13"
    height="13"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
