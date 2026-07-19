export type PresetGrid = readonly (readonly boolean[])[]

const PRESETS = {
  glider: [
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ],
  blinker: [
    [false, false, false],
    [true, true, true],
    [false, false, false],
  ],
  toad: [
    [false, false, false, false],
    [false, true, true, true],
    [true, true, true, false],
    [false, false, false, false],
  ],
  beacon: [
    [true, true, false, false],
    [true, true, false, false],
    [false, false, true, true],
    [false, false, true, true],
  ],
  pulsar: [
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
  ],
  lwss: [
    [false, true, false, false, true],
    [true, false, false, false, false],
    [true, false, false, false, true],
    [true, true, true, true, false],
  ],
  mwss: [
    [false, false, true, false, false, false],
    [true, false, false, false, true, false],
    [false, false, false, false, false, true],
    [true, false, false, false, false, true],
    [false, true, true, true, true, true],
  ],
  block: [
    [true, true],
    [true, true],
  ],
  beehive: [
    [false, true, true, false],
    [true, false, false, true],
    [false, true, true, false],
  ],
  loaf: [
    [false, true, true, false],
    [true, false, false, true],
    [false, true, false, true],
    [false, false, true, false],
  ],
  'glider gun': [
            [ false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true,  false, false, false, false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true,  false, true,  false, false, false, false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false, false, false, false, false, true,  true,  false, false, false, false, false, false, true,  true,  false, false, false, false, false, false, false, false, false, false, false, false, true,  true  ],
            [ false, false, false, false, false, false, false, false, false, false, false, true,  false, false, false, true,  false, false, false, false, true,  true,  false, false, false, false, false, false, false, false, false, false, false, false, true,  true  ],
            [ true,  true,  false, false, false, false, false, false, false, false, true,  false, false, false, false, false, true,  false, false, false, true,  true,  false, false, false, false, false, false, false, false, false, false, false, false, false, false ],
            [ true,  true,  false, false, false, false, false, false, false, false, true,  false, false, false, true,  false, true,  true,  false, false, false, false, true,  false, true,  false, false, false, false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false, false, false, true,  false, false, false, false, false, true,  false, false, false, false, false, false, false, true,  false, false, false, false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false, false, false, false, true,  false, false, false, true,  false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false ],
            [ false, false, false, false, false, false, false, false, false, false, false, false, true,  true,  false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false ]
        ],
} as const satisfies Record<string, PresetGrid>

export type PresetName = keyof typeof PRESETS

export function getPreset(name: string): boolean[][] {
  const preset = PRESETS[name.toLowerCase() as PresetName]

  if (!preset) {
    throw new Error(`Preset not found: ${name}`)
  }

  return preset.map((row) => row.slice())
}

export function getPresetSize(name: string): number {
  const preset = PRESETS[name.toLowerCase() as PresetName]

  if (!preset) {
    throw new Error(`Preset not found: ${name}`)
  }

  return preset.reduce((count, row) => count + row.filter(Boolean).length, 0)
}

export function getPresetNames(): string[] {
  return Object.keys(PRESETS).sort((left, right) => left.localeCompare(right))
}