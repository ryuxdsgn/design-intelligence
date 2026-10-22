/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @ryux/core ships TypeScript source; the editor shares its curation logic with the CLI pipeline.
  transpilePackages: ["@ryux/core"],
  // The editor's browser client needs the project URL and the anon key (public by design; RLS guards data).
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? "",
  },
};

export default nextConfig;
