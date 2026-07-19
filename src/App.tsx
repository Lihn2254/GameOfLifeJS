import { useEffect, useReducer, useRef, useState } from "react";
import { Game, getPresetNames } from "./core_game";

const GRID_SIZE = 100;
const INITIAL_SPEED_MS = 80;
const CANVAS_RESOLUTION = 800; // High resolution for crisp rendering

function App() {
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, forceRender] = useReducer((value: number) => value + 1, 0);
  const [isRunning, setIsRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(INITIAL_SPEED_MS);
  const [selectedPreset, setSelectedPreset] = useState("glider");

  if (gameRef.current === null) {
    gameRef.current = new Game(GRID_SIZE);
  }

  const game = gameRef.current;
  const aliveCells = game.getGrid();
  const presetNames = getPresetNames();

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      game.calculateNextGen();
      forceRender();
    }, speedMs);

    return () => window.clearInterval(intervalId);
  }, [game, isRunning, speedMs]);

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = canvas.width / GRID_SIZE;

    // Paint alive cells
    ctx.fillStyle = "#7ff3cc"; // Matches var(--accent)

    for (const cell of aliveCells) {
      // cell.y represents the column (X axis), cell.x represents the row (Y axis)
      // We subtract 1 from the size to simulate a subtle grid line gap
      ctx.fillRect(
        cell.y * cellSize,
        cell.x * cellSize,
        cellSize - 1,
        cellSize - 1,
      );
    }
  }); // Runs after every render

  const startGame = () => setIsRunning(true);
  const stopGame = () => setIsRunning(false);

  const resetGame = () => {
    game.reset();
    setIsRunning(false);
    forceRender();
  };

  const cleanGrid = () => {
    game.setBlankGrid();
    setIsRunning(false);
    forceRender();
  };

  const loadPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    game.loadPreset(presetName);
    setIsRunning(false);
    forceRender();
  };

  const toggleCell = (row: number, col: number) => {
    if (isRunning) return;
    game.toggleCell(row, col);
    forceRender();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Scale handles mismatch between visual CSS size and actual canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const cellSize = canvas.width / GRID_SIZE;
    const col = Math.floor(clickX / cellSize);
    const row = Math.floor(clickY / cellSize);

    toggleCell(row, col);
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Conway's Game of Life</p>
          <div></div>
          <h1>Conway's Game Of Life</h1>
          <p className="hero-copy">
            Paint cells manually, load a known preset, then start the simulation
            at whatever speed feels right.
          </p>
        </div>
      </section>

      <div className="status-card">
        <div>
          <span className="status-label">Generation</span>
          <strong>{game.getGeneration()}</strong>
        </div>
        <div>
          <span className="status-label">State</span>
          <strong>{isRunning ? "Running" : "Paused"}</strong>
        </div>
        <div>
          <span className="status-label">Grid</span>
          <strong>
            {GRID_SIZE} x {GRID_SIZE}
          </strong>
        </div>
      </div>

      <section className="workspace">
        <aside className="panel controls-panel">
          <div className="panel-section">
            <div className="section-heading">Playback</div>
            <div className="button-row">
              <button
                type="button"
                className="primary"
                onClick={startGame}
                disabled={isRunning}
              >
                Start
              </button>
              <button type="button" onClick={stopGame} disabled={!isRunning}>
                Stop
              </button>
            </div>
            <div className="button-row">
              <button type="button" onClick={resetGame}>
                Reset
              </button>
              <button type="button" onClick={cleanGrid}>
                Clean grid
              </button>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-heading">Preset</div>
            <label className="field">
              <span>Load a pattern</span>
              <select
                value={selectedPreset}
                onChange={(event) => loadPreset(event.target.value)}
              >
                {presetNames.map((presetName) => (
                  <option key={presetName} value={presetName}>
                    {presetName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="panel-section">
            <div className="section-heading">Speed</div>
            <label className="field slider-field">
              <div className="slider-header">
                <span>Generation timeout</span>
                <strong>{speedMs} ms</strong>
              </div>
              <input
                type="range"
                min="40"
                max="1000"
                step="20"
                value={speedMs}
                onChange={(event) => setSpeedMs(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="panel-section note">
            Click cells while the game is stopped. When you start the
            simulation, the grid advances using the selected timeout.
          </div>
        </aside>

        <canvas
          ref={canvasRef}
          className="board canvas-board"
          width={CANVAS_RESOLUTION}
          height={CANVAS_RESOLUTION}
          onClick={handleCanvasClick}
        />
      </section>
    </main>
  );
}

export default App;
