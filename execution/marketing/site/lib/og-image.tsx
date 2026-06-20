import type { ReactElement } from 'react';
import { ImageResponse } from 'next/og';

/** Shared Hult mark for favicons and OG images */
export function hultMarkSvg(size: number, showSubtitle = false) {
  const fontSize = Math.round(size * 0.38);
  const subSize = Math.round(size * 0.12);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f2f3ee',
        color: '#0e0e0c',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: size * 0.04 }}>
        <span style={{ fontSize, fontWeight: 700, color: '#a81202' }}>Hult</span>
        {showSubtitle ? (
          <span style={{ fontSize: subSize, fontFamily: 'system-ui, sans-serif', opacity: 0.75 }}>
            Cohort
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ogImageJsx(title: string, subtitle: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: '#f2f3ee',
        color: '#0e0e0c',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#a81202', fontFamily: 'Georgia, serif' }}>
          Hult
        </span>
        <span style={{ fontSize: 22, fontFamily: 'system-ui, sans-serif', color: '#74857c' }}>
          Developer Program
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.45,
            color: '#4a4a44',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          fontSize: 20,
          fontFamily: 'system-ui, sans-serif',
          color: '#74857c',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Fall 2026 Cohort
      </div>
    </div>
  );
}

export function pngImageResponse(element: ReactElement, width: number, height: number) {
  return new ImageResponse(element, { width, height });
}
