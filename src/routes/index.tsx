import { createFileRoute } from "@tanstack/react-router";
import { WordfightApp } from "@/components/wordfight/app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <WordfightApp />;
}
