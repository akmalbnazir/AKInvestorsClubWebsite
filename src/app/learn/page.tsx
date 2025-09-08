import { redirect } from "next/navigation";
import { getSession } from "lib/auth";
import UltraCard from "components/ui/UltraCard";

export default async function LearnPage() {
  // Protect the route
  const s = await getSession();
  if (!s) redirect("/signin");

  // Page content
  return (
    <div className="w-full max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
      <UltraCard className="text-center">
        <h3 className="text-xl font-bold">Beginner</h3>
        <p className="text-ak-sub mt-2">Basics of stocks, compounding, risk.</p>
        <a
          href="/learn/level/beginner"
          className="mt-4 inline-block px-4 py-2 rounded-lg neon-border"
        >
          Start
        </a>
      </UltraCard>

      <UltraCard className="text-center">
        <h3 className="text-xl font-bold">Intermediate</h3>
        <p className="text-ak-sub mt-2">
          ETF vs. stock, diversification, beta.
        </p>
        <a
          href="/learn/level/intermediate"
          className="mt-4 inline-block px-4 py-2 rounded-lg neon-border"
        >
          Start
        </a>
      </UltraCard>

      <UltraCard className="text-center">
        <h3 className="text-xl font-bold">Expert</h3>
        <p className="text-ak-sub mt-2">
          Options, valuation, macro linkages.
        </p>
        <a
          href="/learn/level/expert"
          className="mt-4 inline-block px-4 py-2 rounded-lg neon-border"
        >
          Start
        </a>
      </UltraCard>
    </div>
  );
}
