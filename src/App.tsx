import { useEffect, useReducer, useRef, useState } from "react";
import { Game, getPresetNames } from "./core_game";

const INITIAL_SPEED_MS = 80;
const CANVAS_RESOLUTION = 1200;

function App() {
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, forceRender] = useReducer((value: number) => value + 1, 0);
  const [isRunning, setIsRunning] = useState(false);
  const [gridSize, setGridSize] = useState(100);
  const [speedMs, setSpeedMs] = useState(INITIAL_SPEED_MS);
  const [selectedPreset, setSelectedPreset] = useState("glider");

  if (gameRef.current === null) {
    gameRef.current = new Game(gridSize);
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

    const cellSize = canvas.width / gridSize;

    // Paint alive cells
    ctx.fillStyle = "#7ff3cc";

    for (const cell of aliveCells) {
      ctx.fillRect(
        cell.y * cellSize,
        cell.x * cellSize,
        cellSize - 1,
        cellSize - 1,
      );
    }
  });

  const handleGridSizeChange = (newGridSize: number) => {
    if (newGridSize > 0) {
      setGridSize(newGridSize);
      gameRef.current = new Game(newGridSize);
    }
  };

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

    const cellSize = canvas.width / gridSize;
    const col = Math.floor(clickX / cellSize);
    const row = Math.floor(clickY / cellSize);

    toggleCell(row, col);
  };

  return (
    <main className="app-shell">
      <section className="header">
        <div className="title-icon">
          <img
            id="game-icon"
            src="/icon_white.png"
            alt="Glider pattern"
            width={100}
            height={100}
          />
          <div className="title-container">
            <span id="subtitle">Conway's</span>
            <span id="title">Game Of Life</span>
          </div>
        </div>
        <p className="description">
          Paint cells manually, load a known preset, then start the simulation
          at whatever speed feels right.
        </p>
      </section>

      <section className="workspace">
        <aside>
          <div className="panel controls-panel">
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
                  <div>
                    <span>Generation timeout</span>
                    <span>(Less is faster)</span>
                  </div>
                  <strong>{speedMs} ms</strong>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="20"
                  value={speedMs}
                  onChange={(event) => setSpeedMs(Number(event.target.value))}
                />
              </label>
            </div>
          </div>
          <div className="gen-card">
            <span className="status-label">Generation</span>
            <strong>{game.getGeneration()}</strong>
          </div>
        </aside>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            className="board"
            width={CANVAS_RESOLUTION}
            height={CANVAS_RESOLUTION}
            onClick={handleCanvasClick}
          />
          <div className="grid-size-container">
            <span className="status-label">Grid Size</span>
            <input
              id="grid-size"
              type="text"
              value={gridSize}
              onChange={(e) =>
                handleGridSizeChange(Number.parseInt(e.target.value))
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
