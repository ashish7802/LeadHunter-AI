'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#090D16', color: '#fff', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#F43F5E' }}>System Recovery</h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px 0' }}>
              {error?.message || 'A root component error was intercepted. Click reset to restore dashboard.'}
            </p>
            <button
              onClick={() => reset()}
              style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', background: '#6366F1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Reset LeadHunter AI
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
