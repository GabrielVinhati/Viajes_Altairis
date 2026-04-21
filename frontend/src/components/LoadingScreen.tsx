'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1200);
    const remove = setTimeout(() => setVisible(false), 1800);
    return () => { clearTimeout(timer); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Hotel SVG animated */}
      <div className="relative mb-6">
        <svg
          width="80"
          height="80"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-building"
        >
          {/* Roof */}
          <polygon points="16,2 2,8 30,8" fill="#1d4ed8" className="animate-roof" />
          <rect x="14" y="3" width="4" height="3" rx="0.5" fill="#60a5fa" className="animate-roof" />

          {/* Building body */}
          <rect x="4" y="8" width="24" height="20" rx="2" fill="#2563eb" className="animate-body" />

          {/* Windows row 1 */}
          <rect x="8" y="12" width="4" height="4" rx="0.5" fill="#bfdbfe" className="animate-window-1" />
          <rect x="14" y="12" width="4" height="4" rx="0.5" fill="#bfdbfe" className="animate-window-2" />
          <rect x="20" y="12" width="4" height="4" rx="0.5" fill="#bfdbfe" className="animate-window-3" />

          {/* Windows row 2 */}
          <rect x="8" y="18" width="4" height="4" rx="0.5" fill="#bfdbfe" className="animate-window-4" />
          <rect x="14" y="18" width="4" height="4" rx="0.5" fill="#bfdbfe" className="animate-window-5" />
          <rect x="20" y="18" width="4" height="4" rx="0.5" fill="#bfdbfe" className="animate-window-6" />

          {/* Door */}
          <rect x="13" y="24" width="6" height="4" rx="0.5" fill="#1e40af" className="animate-door" />
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-2xl font-bold text-primary-700 animate-fade-in">Altairis</h1>
      <p className="text-sm text-gray-400 mt-1 animate-fade-in-delay">Backoffice Operativo</p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-6">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-dot-1" />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-dot-2" />
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-dot-3" />
      </div>
    </div>
  );
}
