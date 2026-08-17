import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-heading text-lg font-semibold">AI Knowledge Assistant</span>
          <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-10 px-4 py-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ask your documents.
            <br />
            Get answers with receipts.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            A demo frontend for a RAG chat API built in Java, Spring Boot, Spring AI, Ollama, and
            pgvector — the backend is the real portfolio piece; this UI just makes it demoable.
          </p>
        </div>

        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-end gap-1.5">
              <div className="max-w-[85%] rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                What does the security policy say about VPN access?
              </div>
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <div className="max-w-[85%] rounded-lg bg-secondary px-3.5 py-2.5 text-sm text-secondary-foreground">
                Remote access requires MFA and a company-managed device.
              </div>
              <span className="rounded-full border border-citation/40 bg-citation/10 px-2 py-0.5 font-mono text-xs text-citation">
                Security Policy.pdf · p.4
              </span>
            </div>
          </div>
        </div>

        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
          Try the demo →
        </Link>

        <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-muted-foreground uppercase">
          <span>RAG chat</span>
          <span>Agent tool-calling</span>
          <span>Document ingestion</span>
        </div>
      </main>
    </div>
  );
}
