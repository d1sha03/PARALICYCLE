import { Sprout } from 'lucide-react';

export const CtaFooter: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="border-t border-[#E4E7DC] bg-[#FBFBF6] mt-6">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-8 h-8 rounded-full bg-[#A3E635] border border-[#65A30D]/25 flex items-center justify-center text-[#1A2E12]">
                <Sprout className="w-4 h-4" />
              </span>
              <span className="font-display text-[16px] font-bold tracking-[0.02em] text-[#1A1B19]">
                PARALICYCLE
              </span>
            </div>
            <p className="text-[13px] text-[#5C5E59] leading-relaxed max-w-[380px]">
              From Stubble to Sustainable. AI-powered agricultural residue recovery and geospatial
              intelligence platform for Punjab, India.
            </p>
            <div className="font-mono mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F7D4] border border-[#C6E89F] text-[#284D16] text-[10.5px] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65A30D]" />
              PROTOTYPE · ALL DATA EXPLICITLY SIMULATED
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#787A74] mb-3">
              Platform
            </div>
            <ul className="space-y-2">
              {[
                ['Overview', '#hero'],
                ['Residue Estimator', '#estimator'],
                ['Field Intelligence & Map', '#map'],
                ['Machinery & Scheduler', '#machinery'],
                ['How It Works', '#how'],
              ].map(([label, href]) => (
                <li key={href}>
                  <button
                    onClick={() => scrollTo(href)}
                    className="text-[13px] text-[#5C5E59] hover:text-[#4D7C0F] transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#787A74] mb-3">
              Data Integrity
            </div>
            <ul className="space-y-2 text-[12.5px] text-[#5C5E59] leading-relaxed">
              <li>• No live satellite detections are claimed; map overlays use demo imagery.</li>
              <li>• No real farmers, village operations, or live machinery availability are represented.</li>
              <li>• Environmental impact remains 0 t verified until audited harvest logs close.</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#EAE9E1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[12px] text-[#787A74]">
            © 2026 PARALICYCLE · From Stubble to Sustainable
          </span>
          <span className="font-mono text-[11px] text-[#787A74]">
            Architected for Next.js + TypeScript · FastAPI · Supabase · OR-Tools
          </span>
        </div>
      </div>
    </footer>
  );
};
