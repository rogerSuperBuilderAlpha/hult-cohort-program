import { ImageResponse } from 'next/og';
import { allHandles, getParticipant } from '@/data/participants';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return allHandles().map((handle) => ({ handle }));
}

export default async function OgImage({ params }: Props) {
  const { handle } = await params;
  const participant = getParticipant(handle);

  const name = participant?.status === 'active' ? participant.name : `@${handle}`;
  const headline = participant?.headline ?? 'Hult Cohort · Summer Pilot 2026';
  const badge =
    participant?.status === 'pending' ? 'Profile pending' : 'Builder profile';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 64,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F7FBF8 55%, #FAD978 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#1F5C45',
            }}
          />
          <span style={{ fontSize: 28, color: '#1F5C45', fontWeight: 600 }}>
            CEAL Green · Hult Cohort
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#3D9B5F',
              margin: 0,
            }}
          >
            {badge}
          </p>
          <h1
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              color: '#1F5C45',
              margin: '16px 0 0',
              maxWidth: 900,
            }}
          >
            {name}
          </h1>
          <p style={{ fontSize: 28, color: '#5A7A6E', margin: '24px 0 0', maxWidth: 900 }}>
            {headline}
          </p>
        </div>
        <p style={{ fontSize: 20, color: '#163D30', margin: 0 }}>
          Caribbean capability, in public · Build Now
        </p>
      </div>
    ),
    { ...size }
  );
}
