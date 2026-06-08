import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Azura" },
      { name: "description", content: "Azura curates objects worth keeping. Built with care, shipped with intention." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold">About Azura</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Azura is a small catalog of objects we'd be proud to live with. We curate across
        electronics, apparel, home, and accessories — favoring honest materials, considered
        design, and brands that build to last.
      </p>
      <p className="mt-4 text-muted-foreground">
        We started Azura because shopping online had become noisy. Our answer: fewer products,
        deeper attention to each one, and a checkout that respects your time.
      </p>
    </div>
  );
}
