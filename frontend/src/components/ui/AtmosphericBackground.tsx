import React from 'react';

export default function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 subtle-grid-pattern opacity-60" />

      {/* Large Floating Gradient Orbs */}
      <div
        className="absolute -top-[15%] left-[10%] w-[520px] h-[520px] rounded-full blur-[130px] opacity-[0.10] animate-orb-1"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, #4338ca 70%, transparent 100%)' }}
      />
      <div
        className="absolute top-[35%] -right-[10%] w-[580px] h-[580px] rounded-full blur-[140px] opacity-[0.09] animate-orb-2"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, #06b6d4 70%, transparent 100%)' }}
      />
      <div
        className="absolute -bottom-[15%] left-[25%] w-[640px] h-[640px] rounded-full blur-[150px] opacity-[0.08] animate-orb-3"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, #7c3aed 70%, transparent 100%)' }}
      />

      {/* Subtle Vignette Edge Mask */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50" />
    </div>
  );
}
