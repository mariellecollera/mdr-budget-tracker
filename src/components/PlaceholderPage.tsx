import Layout from "./Layout";

/** A page that has its route and tab but has not been built yet. */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Layout variant="panel">
      <h1
        className="font-display text-lg"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h1>
      <p
        className="mt-3 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        This page is coming soon.
      </p>
    </Layout>
  );
}
