/// <reference types="vite/client" />

/**
 * Vite's ?inline query loads a file's processed text content as a string.
 * For .css files, that's the post-Tailwind output — exactly what we
 * inject into the Shadow DOM via boot.ts.
 */
declare module '*.css?inline' {
  const cssText: string;
  export default cssText;
}
