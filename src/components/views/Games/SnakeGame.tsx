import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAudio } from '../../../context/AudioContext';

export const SnakeGame: React.FC = () => {
  const { lang, t } = useLanguage();
  const { playClick, playNotificationSound } = useAudio();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('snake_highscore') || '0', 10);
  });
  const [speed, setSpeed] = useState<number>(80);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');

  const snakeRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const nextDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number }>({ x: 15, y: 10 });
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gridSize = 20;
  const tileCount = 20; // 400 / 20 = 20

  const placeFood = () => {
    let newX: number;
    let newY: number;
    while (true) {
      newX = Math.floor(Math.random() * tileCount);
      newY = Math.floor(Math.random() * tileCount);
      const onSnake = snakeRef.current.some((s) => s.x === newX && s.y === newY);
      if (!onSnake) break;
    }
    foodRef.current = { x: newX, y: newY };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Food (neon pulse)
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 10;
    ctx.fillRect(foodRef.current.x * gridSize + 2, foodRef.current.y * gridSize + 2, gridSize - 4, gridSize - 4);
    ctx.shadowBlur = 0;

    // Snake
    snakeRef.current.forEach((part, index) => {
      if (index === 0) {
        ctx.fillStyle = '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#00cc55';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0;
  };

  const update = () => {
    dirRef.current = nextDirRef.current;
    const head = {
      x: snakeRef.current[0].x + dirRef.current.x,
      y: snakeRef.current[0].y + dirRef.current.y,
    };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      handleGameOver();
      return;
    }

    // Self collision
    if (snakeRef.current.some((part) => part.x === head.x && part.y === head.y)) {
      handleGameOver();
      return;
    }

    const newSnake = [head, ...snakeRef.current];

    // Check food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((prev) => {
        const newScore = prev + 10;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snake_highscore', String(newScore));
        }
        return newScore;
      });
      playClick();
      placeFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  };

  const handleGameOver = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    setGameState('gameover');
    playNotificationSound('error');
  };

  const startGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    setScore(0);
    placeFood();
    setGameState('running');
    playClick();

    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(update, speed);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code) && dirRef.current.y === 0) {
        nextDirRef.current = { x: 0, y: -1 };
        e.preventDefault();
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && dirRef.current.y === 0) {
        nextDirRef.current = { x: 0, y: 1 };
        e.preventDefault();
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && dirRef.current.x === 0) {
        nextDirRef.current = { x: -1, y: 0 };
        e.preventDefault();
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && dirRef.current.x === 0) {
        nextDirRef.current = { x: 1, y: 0 };
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial draw
  useEffect(() => {
    draw();
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  const changeDirection = (x: number, y: number) => {
    if (x !== 0 && dirRef.current.x === 0) {
      nextDirRef.current = { x, y: 0 };
    } else if (y !== 0 && dirRef.current.y === 0) {
      nextDirRef.current = { x: 0, y };
    }
  };

  const overlayText =
    gameState === 'idle'
      ? lang === 'cs'
        ? 'Stiskněte START pro spuštění'
        : 'Press START to Play'
      : lang === 'cs'
      ? `Konec hry! Skóre: ${score}`
      : `Game Over! Score: ${score}`;

  return (
    <div className="game-view active" id="view-game-snake">
      <div className="game-scoreboard">
        <div className="score-box">
          <span>{lang === 'cs' ? 'Skóre:' : 'Score:'}</span> <strong>{score}</strong>
        </div>
        <div className="score-box">
          <span>{lang === 'cs' ? 'Nejlepší:' : 'Highscore:'}</span> <strong>{highScore}</strong>
        </div>
        <div className="score-box">
          <label
            htmlFor="snake-speed"
            style={{
              display: 'inline',
              marginRight: '0.5rem',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
            }}
          >
            {lang === 'cs' ? 'Obtížnost:' : 'Difficulty:'}
          </label>
          <select
            id="snake-speed"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            style={{ width: 'auto', padding: '0.2rem 0.5rem', display: 'inline-block' }}
          >
            <option value="120">Easy</option>
            <option value="80">Medium</option>
            <option value="50">Hard</option>
          </select>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} id="snake-canvas" width={400} height={400} />
        {gameState !== 'running' && (
          <div className="game-overlay" id="snake-overlay">
            <div className="overlay-text">{overlayText}</div>
            <button
              className="btn"
              id="btn-snake-start"
              style={{ marginTop: '1rem', padding: '0.6rem 1.8rem', fontSize: '0.8rem' }}
              onClick={startGame}
            >
              {gameState === 'idle' ? 'START' : lang === 'cs' ? 'HRÁT ZNOVU' : 'PLAY AGAIN'}
            </button>
          </div>
        )}
      </div>

      {/* MOBILE D-PAD */}
      <div className="mobile-dpad">
        <div className="dpad-row">
          <button className="dpad-btn" id="dpad-up" onClick={() => changeDirection(0, -1)}>
            <i className="fa-solid fa-caret-up" />
          </button>
        </div>
        <div className="dpad-row">
          <button className="dpad-btn" id="dpad-left" onClick={() => changeDirection(-1, 0)}>
            <i className="fa-solid fa-caret-left" />
          </button>
          <div className="dpad-center" />
          <button className="dpad-btn" id="dpad-right" onClick={() => changeDirection(1, 0)}>
            <i className="fa-solid fa-caret-right" />
          </button>
        </div>
        <div className="dpad-row">
          <button className="dpad-btn" id="dpad-down" onClick={() => changeDirection(0, 1)}>
            <i className="fa-solid fa-caret-down" />
          </button>
        </div>
      </div>
    </div>
  );
};
