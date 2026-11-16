// Hard-coded admin allowlist. Add emails here to grant access to
// admin-only surfaces. Match is case-insensitive on the user's
// verified session email.
//
// Kept in code (not a DB column or env var) intentionally — admin
// changes are rare and gating them behind a code review + deploy is
// the right amount of friction for a solo/small-team product.
const ADMIN_EMAILS: readonly string[] = ['qwertymoulik@gmail.com', 'dev@localhost.dev'];

const ADMIN_SET = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

interface SessionLike {
  user?: { email?: string | null } | null;
}

export function isAdmin(session: SessionLike | null | undefined): boolean {
  const email = session?.user?.email?.toLowerCase();
  return !!email && ADMIN_SET.has(email);
}
