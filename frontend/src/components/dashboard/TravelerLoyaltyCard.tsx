import React, { useState } from 'react';
import { Crown, Sparkles, Gift, Check, ArrowRight, Shield, Award, Zap, Coffee, Luggage } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoyaltyProps {
  userName?: string;
}

export const TravelerLoyaltyCard: React.FC<LoyaltyProps> = ({ userName = 'Prithviraj Sharma' }) => {
  const [skyPoints, setSkyPoints] = useState(28450);
  const [redeemedPerk, setRedeemedPerk] = useState<string | null>(null);

  const perks = [
    {
      id: 'lounge',
      name: 'Complimentary VIP Lounge Access',
      cost: 3000,
      icon: <Coffee className="w-4 h-4 text-amber-500" />,
      desc: 'Valid at DEL, BOM, BLR, DXB Lounges',
    },
    {
      id: 'seat_upgrade',
      name: 'Complimentary Business Class Upgrade',
      cost: 8500,
      icon: <Crown className="w-4 h-4 text-indigo-500" />,
      desc: 'Instant 1-segment cabin bump on next booking',
    },
    {
      id: 'extra_bag',
      name: 'Extra 10kg Check-in Luggage',
      cost: 1500,
      icon: <Luggage className="w-4 h-4 text-cyan-500" />,
      desc: 'Applied automatically to all domestic flights',
    },
  ];

  const handleRedeem = (perk: (typeof perks)[0]) => {
    if (skyPoints < perk.cost) {
      alert('Not enough SkyPoints for this privilege.');
      return;
    }
    setSkyPoints((prev) => prev - perk.cost);
    setRedeemedPerk(perk.name);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Holographic Digital Member Card (5 Cols) */}
      <div className="lg:col-span-5 relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c162d] via-[#161f38] to-[#0a1020] border border-brand-500/40 shadow-2xl overflow-hidden flex flex-col justify-between text-white group">
        {/* Holographic light sweep */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        <div>
          {/* Card Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-400 fill-amber-400/20" />
              <span className="text-xs font-mono uppercase font-black tracking-widest bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Titanium Elite
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono">
              Tier Status: Active
            </span>
          </div>

          {/* Member Name */}
          <div className="mt-8 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              SkyHaven Privileges
            </div>
            <div className="text-2xl font-black font-display text-white tracking-tight">
              {userName}
            </div>
            <div className="text-xs font-mono text-slate-400">
              Member ID: <strong className="text-slate-200">SH-9802-9912</strong>
            </div>
          </div>
        </div>

        {/* Card Bottom Row: SkyPoints Balance */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Available SkyMiles
            </span>
            <div className="text-3xl font-black font-mono text-cyan-300">
              {skyPoints.toLocaleString()} <span className="text-sm font-normal text-slate-300">pts</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              ≈ ₹{Math.round(skyPoints / 2).toLocaleString('en-IN')} travel value
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Next Tier</span>
            <span className="text-xs font-bold text-white font-mono">Platinum (30K)</span>
          </div>
        </div>
      </div>

      {/* Rewards Redemption & Tier Perks (7 Cols) */}
      <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Elite Rewards & Privilege Vault
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Redeem your SkyMiles for immediate flight upgrades and complimentary VIP perks.
              </p>
            </div>
          </div>

          {redeemedPerk && (
            <div className="p-3.5 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Privilege Unlocked: {redeemedPerk}! Applied to your profile.</span>
            </div>
          )}

          {/* Perks list */}
          <div className="space-y-3">
            {perks.map((perk) => (
              <div
                key={perk.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-brand-500/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700">
                    {perk.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {perk.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{perk.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                      {perk.cost.toLocaleString()} pts
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRedeem(perk)}
                    className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Progress to Platinum Tier
            </span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
              28,450 / 30,000 pts (94%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 rounded-full w-[94%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
