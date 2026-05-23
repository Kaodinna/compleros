import Link from "next/link";
import Logo from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" aria-label="Compleros home">
          <Logo variant="navy" height={44} />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>
      <footer className="px-6 py-5 text-center text-[13px] text-muted">
        &copy; {new Date().getFullYear()} Compleros. All rights reserved.
      </footer>
    </div>
  );
}
