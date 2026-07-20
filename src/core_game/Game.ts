import { CellOutOfBoundsException } from './errors.ts'
import { getPreset } from './presets.ts'

export interface Cell {
  x: number
  y: number
}

export class Game {
  private aliveCells: Set<string>
  
  private gridSize: number

  private initialState: Cell[]

  private generation = 0

  constructor(gridSize: number, initialState: Cell[] = []) {
    if (!Number.isInteger(gridSize) || gridSize <= 0) {
      throw new Error('gridSize must be a positive integer')
    }

    this.gridSize = gridSize
    this.aliveCells = new Set()
    this.initialState = initialState.map((cell) => ({ ...cell }))

    if (initialState.length > 0) {
      this.loadInitialState()
    }
  }

  getGrid(): Cell[] {
    const alive: Cell[] = []
    
    for (const key of this.aliveCells) {
      const [x, y] = key.split(',').map(Number)
      alive.push({ x, y })
    }
    
    return alive
  }

  getGeneration(): number {
    return this.generation
  }

  getGridSize(): number {
    return this.gridSize;
  }

  setGridSize(gridSize: number): void {
    this.gridSize = gridSize;
  }

  setInitialState(initialState: Cell[]): void {
    this.initialState = initialState.map((cell) => ({ ...cell }))
    this.cleanGrid()
    this.loadInitialState()
  }

  loadPreset(presetName: string): void {
    const preset = getPreset(presetName)
    const origin = this.getPatternOrigin(preset)
    const cells: Cell[] = []

    for (let x = 0; x < preset.length; x++) {
      for (let y = 0; y < preset[x].length; y++) {
        if (preset[x][y]) {
          cells.push({ x: origin.x + x, y: origin.y + y })
        }
      }
    }

    this.cleanGrid()
    this.initialState = cells
    this.loadInitialState()
  }

  reset(): void {
    this.cleanGrid()
    this.loadInitialState()
  }

  setBlankGrid(): void {
    this.cleanGrid()
    this.initialState = []
    this.generation = 0
  }

  calculateNextGen(): void {
    const neighborCounts = new Map<string, number>()

    // Step 1: Count neighbors only around currently alive cells
    for (const cellKey of this.aliveCells) {
      const [x, y] = cellKey.split(',').map(Number)

      for (let row = x - 1; row <= x + 1; row++) {
        for (let col = y - 1; col <= y + 1; col++) {
          if (row === x && col === y) continue // Skip the cell itself
          if (!this.isWithinBounds(row, col)) continue // Skip out of bounds

          const neighborKey = `${row},${col}`
          neighborCounts.set(neighborKey, (neighborCounts.get(neighborKey) || 0) + 1)
        }
      }
    }

    const nextAliveCells = new Set<string>()

    // Step 2: Apply Conway's rules using the neighbor counts map
    for (const [cellKey, count] of neighborCounts.entries()) {
      if (count === 3) {
        // Any cell with exactly 3 live neighbors becomes a live cell
        nextAliveCells.add(cellKey)
      } else if (count === 2 && this.aliveCells.has(cellKey)) {
        // Any live cell with 2 live neighbors lives on to the next generation
        nextAliveCells.add(cellKey)
      }
    }

    this.aliveCells = nextAliveCells
    this.generation += 1
  }

  toggleCell(row: number, col: number): void {
    if (!this.isWithinBounds(row, col)) return

    const key = `${row},${col}`
    if (this.aliveCells.has(key)) {
      this.aliveCells.delete(key)
    } else {
      this.aliveCells.add(key)
    }
  }

  private cleanGrid(): void {
    this.aliveCells.clear()
  }

  private loadInitialState(): void {
    const invalidCell = this.initialState.find((cell) => !this.isWithinBounds(cell.x, cell.y))

    if (invalidCell) {
      throw new CellOutOfBoundsException()
    }

    for (const cell of this.initialState) {
      this.aliveCells.add(`${cell.x},${cell.y}`)
    }

    this.generation = 0
  }

  private isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.gridSize && y < this.gridSize
  }

  private getPatternOrigin(pattern: boolean[][]): Cell {
    const patternHeight = pattern.length
    const patternWidth = pattern[0]?.length ?? 0

    return {
      x: Math.floor((this.gridSize - patternHeight) / 2),
      y: Math.floor((this.gridSize - patternWidth) / 2),
    }
  }
}

export type { CellOutOfBoundsException }