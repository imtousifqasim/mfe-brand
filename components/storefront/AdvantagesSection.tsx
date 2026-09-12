import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { Advantage } from '@/types/database';

interface AdvantagesSectionProps {
  advantages: Advantage[];
}

export function AdvantagesSection({ advantages }: AdvantagesSectionProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#b87414]" strokeWidth={1.75} />;
      case 'Truck': return <Truck className="w-5 h-5 text-[#b87414]" strokeWidth={1.75} />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-[#b87414]" strokeWidth={1.75} />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-[#b87414]" strokeWidth={1.75} />;
      default: return <ShieldCheck className="w-5 h-5 text-[#b87414]" strokeWidth={1.75} />;
    }
  };

  return (
    <section className="border-y border-[#eae7e2] bg-[#faf8f5] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8">
          {advantages.map((adv) => (
            <div
              key={adv.id}
              className="flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 group hover:bg-white/60"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-[#eae7e2] flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#d99026] group-hover:scale-105 transition-all duration-300 mt-0.5">
                {getIcon(adv.icon_name)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-sans font-bold text-[14px] text-[#141414] leading-snug group-hover:text-[#b87414] transition-colors">
                  {adv.title}
                </h3>
                <p className="font-sans text-[12px] text-[#6b6b6b] leading-relaxed mt-1 font-normal">
                  {adv.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
