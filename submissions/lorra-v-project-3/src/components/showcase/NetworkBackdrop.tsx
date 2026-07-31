type Tone = "home" | "projects" | "builders" | "partners";

type Props = {
  tone?: Tone;
  className?: string;
};

const toneVars: Record<
  Tone,
  { a: string; b: string; c: string; line: string }
> = {
  home: {
    a: "#3dffb5",
    b: "#e0a458",
    c: "#a78bfa",
    line: "rgba(61,255,181,0.28)",
  },
  projects: {
    a: "#3dffb5",
    b: "#3dffb5",
    c: "#3dffb5",
    line: "rgba(61,255,181,0.35)",
  },
  builders: {
    a: "#e0a458",
    b: "#e0a458",
    c: "#e0a458",
    line: "rgba(224,164,88,0.35)",
  },
  partners: {
    a: "#a78bfa",
    b: "#a78bfa",
    c: "#a78bfa",
    line: "rgba(167,139,250,0.35)",
  },
};

export function NetworkBackdrop({ tone = "home", className = "" }: Props) {
  const colors = toneVars[tone];
  const glowId = `nodeGlow-${tone}`;

  return (
    <div
      aria-hidden
      className={["pointer-events-none absolute inset-0 overflow-hidden", className].join(
        " ",
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${colors.a}29, transparent 42%), radial-gradient(ellipse at 80% 10%, ${colors.c}24, transparent 40%), radial-gradient(ellipse at 70% 80%, ${colors.b}1a, transparent 45%)`,
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.a} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colors.a} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          stroke={colors.line}
          strokeWidth="1"
          className="animate-[networkPulse_6s_ease-in-out_infinite]"
        >
          <line x1="180" y1="160" x2="420" y2="220" />
          <line x1="420" y1="220" x2="640" y2="140" />
          <line x1="640" y1="140" x2="860" y2="250" />
          <line x1="420" y1="220" x2="520" y2="420" />
          <line x1="520" y1="420" x2="780" y2="480" />
          <line x1="860" y1="250" x2="980" y2="420" />
          <line x1="180" y1="160" x2="260" y2="380" />
          <line x1="260" y1="380" x2="520" y2="420" />
          <line x1="780" y1="480" x2="980" y2="420" />
        </g>

        <g className="animate-[nodeDrift_10s_ease-in-out_infinite]">
          <circle cx="180" cy="160" r="5" fill={colors.a} />
          <circle cx="180" cy="160" r="18" fill={`url(#${glowId})`} />
          <circle cx="420" cy="220" r="6" fill={colors.b} />
          <circle
            cx="420"
            cy="220"
            r="22"
            fill={`url(#${glowId})`}
            opacity="0.7"
          />
          <circle cx="640" cy="140" r="5" fill={colors.c} />
          <circle cx="860" cy="250" r="6" fill={colors.a} />
          <circle cx="520" cy="420" r="7" fill={colors.b} />
          <circle
            cx="520"
            cy="420"
            r="24"
            fill={`url(#${glowId})`}
            opacity="0.55"
          />
          <circle cx="780" cy="480" r="5" fill={colors.c} />
          <circle cx="980" cy="420" r="6" fill={colors.a} />
          <circle cx="260" cy="380" r="4" fill={colors.b} />
        </g>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/55 to-background" />
    </div>
  );
}
