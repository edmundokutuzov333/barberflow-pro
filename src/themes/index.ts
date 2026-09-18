export type Theme = {
  key: string;
  name: string;
  vars: {
    "--canvas-glow-a": string;
    "--canvas-glow-b": string;
    "--accent": string;
    "--accent-soft": string;
    "--accent-ink": string;
  };
};

export const THEMES: Theme[] = [
  {
    key: "violet-noir",
    name: "Violeta noir",
    vars: {
      "--canvas-glow-a": "#1a102f",
      "--canvas-glow-b": "#0c0614",
      "--accent": "#9d7bf5",
      "--accent-soft": "#b59eff",
      "--accent-ink": "#120c1f",
    },
  },
  {
    key: "neon-lilac",
    name: "Lilás néon",
    vars: {
      "--canvas-glow-a": "#241243",
      "--canvas-glow-b": "#0f0720",
      "--accent": "#b47bff",
      "--accent-soft": "#cfa9ff",
      "--accent-ink": "#150b26",
    },
  },
  {
    key: "midnight-indigo",
    name: "Índigo meia-noite",
    vars: {
      "--canvas-glow-a": "#12193a",
      "--canvas-glow-b": "#070b1c",
      "--accent": "#7b8cf5",
      "--accent-soft": "#9fb0ff",
      "--accent-ink": "#0b1026",
    },
  },
  {
    key: "cyan-abyss",
    name: "Abismo ciano",
    vars: {
      "--canvas-glow-a": "#082a33",
      "--canvas-glow-b": "#04141a",
      "--accent": "#4fc9e8",
      "--accent-soft": "#7bd7f5",
      "--accent-ink": "#04161c",
    },
  },
  {
    key: "emerald-smoke",
    name: "Fumo esmeralda",
    vars: {
      "--canvas-glow-a": "#0b2b22",
      "--canvas-glow-b": "#041410",
      "--accent": "#3fc79a",
      "--accent-soft": "#6ee7b7",
      "--accent-ink": "#04170f",
    },
  },
  {
    key: "amber-ash",
    name: "Cinza âmbar",
    vars: {
      "--canvas-glow-a": "#2e2110",
      "--canvas-glow-b": "#150e05",
      "--accent": "#d9a03e",
      "--accent-soft": "#e0b057",
      "--accent-ink": "#1a1105",
    },
  },
  {
    key: "rose-quartz",
    name: "Quartzo rosa",
    vars: {
      "--canvas-glow-a": "#331424",
      "--canvas-glow-b": "#170812",
      "--accent": "#e86f9e",
      "--accent-soft": "#f59ac0",
      "--accent-ink": "#1d0813",
    },
  },
  {
    key: "plum-ember",
    name: "Brasa ameixa",
    vars: {
      "--canvas-glow-a": "#2c1030",
      "--canvas-glow-b": "#140618",
      "--accent": "#c06ae0",
      "--accent-soft": "#d79bf0",
      "--accent-ink": "#18081c",
    },
  },
  {
    key: "nordic-mono",
    name: "Mono nórdico",
    vars: {
      "--canvas-glow-a": "#1d2126",
      "--canvas-glow-b": "#0a0c0e",
      "--accent": "#a9b4c2",
      "--accent-soft": "#d3dae2",
      "--accent-ink": "#0f1216",
    },
  },
  {
    key: "blood-orange",
    name: "Laranja sangue",
    vars: {
      "--canvas-glow-a": "#331408",
      "--canvas-glow-b": "#170803",
      "--accent": "#f0703c",
      "--accent-soft": "#ff9366",
      "--accent-ink": "#1a0803",
    },
  },
];

export const DEFAULT_THEME_KEY = "violet-noir";

export function themeByKey(key: string | null | undefined): Theme {
  return THEMES.find((t) => t.key === key) ?? THEMES[0]!;
}

export function applyTheme(key: string | null | undefined) {
  if (typeof document === "undefined") return;
  const theme = themeByKey(key);
  const root = document.documentElement;
  for (const [name, value] of Object.entries(theme.vars)) {
    root.style.setProperty(name, value);
  }
}
