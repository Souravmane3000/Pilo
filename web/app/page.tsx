import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import HowItWorks from "@/components/landing/HowItWorks";
import Navbar from "@/components/landing/Navbar";
import ProductPreview from "@/components/landing/ProductPreview";

export default function Home() {
  return (
    <div id="app-content" className="flex min-h-screen flex-col overflow-y-auto bg-[#0B0F14] font-sans text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(56,189,248,0.08),transparent_35%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />

      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />

        <section id="product-preview" className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Product Preview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Real-time execution. Clear visibility. Full control.
          </h2>
          <ProductPreview />
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
          <div className="rounded-3xl border border-white/5 bg-[#111827] px-6 py-10 text-center shadow-[0_20px_65px_rgba(2,6,23,0.4)] transition-all duration-200 ease-out hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] sm:px-10">
            <h3 className="text-3xl font-semibold tracking-tight text-white">
              Start operating your CRM the smarter way.
            </h3>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
