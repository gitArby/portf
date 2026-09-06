import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAudio } from '../../../context/AudioContext';

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 10;
const COLS = 10;
const TOTAL_MINES = 15;

export const MinesweeperGame: React.FC = () => {
  const { lang, t } = useLanguage();
  const { playClick, playNotificationSound } = useAudio();

  const [board, setBoard] = useState<Cell[][]>([]);
  const [firstClick, setFirstClick] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initBoard = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTime(0);
    setFirstClick(true);
    setGameOver(false);
    setGameWon(false);

    const newBoard: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
  };

  useEffect(() => {
    initBoard();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const placeMines = (safeR: number, safeC: number, currentBoard: Cell[][]) => {
    let placed = 0;
    while (placed < TOTAL_MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if ((r === safeR && c === safeC) || currentBoard[r][c].isMine) continue;
      currentBoard[r][c].isMine = true;
      placed++;
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentBoard[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (currentBoard[nr][nc].isMine) count++;
            }
          }
        }
        currentBoard[r][c].neighborMines = count;
      }
    }
  };

  const revealCell = (r: number, c: number, activeBoard: Cell[][]) => {
    const cell = activeBoard[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
      // Hit a mine!
      setGameOver(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playNotificationSound('error');
      // Reveal all mines
      activeBoard.forEach((row) => {
        row.forEach((cItem) => {
          if (cItem.isMine) cItem.isRevealed = true;
        });
      });
      return;
    }

    // If zero neighbor mines, flood fill
    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (!activeBoard[nr][nc].isRevealed) {
              revealCell(nr, nc, activeBoard);
            }
          }
        }
      }
    }

    // Check win condition
    let unrevealedSafe = 0;
    activeBoard.forEach((row) => {
      row.forEach((cItem) => {
        if (!cItem.isMine && !cItem.isRevealed) unrevealedSafe++;
      });
    });

    if (unrevealedSafe === 0) {
      setGameWon(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playNotificationSound('success');
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || gameWon) return;

    if (flagMode) {
      handleToggleFlag(r, c);
      return;
    }

    playClick();
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    if (firstClick) {
      placeMines(r, c, newBoard);
      setFirstClick(false);
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    revealCell(r, c, newBoard);
    setBoard(newBoard);
  };

  const handleToggleFlag = (r: number, c: number) => {
    if (gameOver || gameWon) return;
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    const cell = newBoard[r][c];
    if (cell.isRevealed) return;
    cell.isFlagged = !cell.isFlagged;
    setBoard(newBoard);
    playClick();
  };

  const flagsUsed = board.reduce(
    (acc, row) => acc + row.filter((c) => c.isFlagged).length,
    0
  );
  const remainingFlags = Math.max(0, TOTAL_MINES - flagsUsed);

  const safeRevealed = board.reduce(
    (acc, row) => acc + row.filter((c) => c.isRevealed && !c.isMine).length,
    0
  );
  const remainingNodes = ROWS * COLS - TOTAL_MINES - safeRevealed;

  return (
    <div className="game-view active" id="view-game-mines">
      <div className="game-scoreboard">
        <div className="score-box">
          <span>{lang === 'cs' ? 'Uzly:' : 'Nodes:'}</span> <strong>{remainingNodes}</strong>
        </div>
        <div className="score-box">
          <span>{lang === 'cs' ? 'Štíty:' : 'Shields:'}</span> <strong>{remainingFlags}</strong>
        </div>
        <div className="score-box">
          <span>{lang === 'cs' ? 'Čas:' : 'Time:'}</span> <strong>{time}</strong>s
        </div>
      </div>

      <div className="mines-control-row">
        <button
          className="btn btn-action"
          id="btn-mines-reset"
          onClick={() => {
            initBoard();
            playClick();
          }}
          style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}
        >
          RESTART
        </button>

        <button
          className="btn btn-action"
          id="btn-mines-mode"
          onClick={() => {
            setFlagMode(!flagMode);
            playClick();
          }}
          style={{
            padding: '0.5rem 1.2rem',
            fontSize: '0.75rem',
            borderColor: 'var(--accent-color)',
            color: 'var(--accent-color)',
          }}
        >
          <i className="fa-solid fa-shield-halved" />{' '}
          <span>
            {flagMode
              ? lang === 'cs'
                ? 'Režim: Štít (Označit)'
                : 'Mode: Shield'
              : lang === 'cs'
              ? 'Režim: Odkrýt'
              : 'Mode: Reveal'}
          </span>
        </button>
      </div>

      <div className="mines-grid-wrapper">
        <div id="mines-board" className="mines-board">
          {board.map((row, r) =>
            row.map((cell, c) => {
              let cellClass = 'mines-cell';
              let content: React.ReactNode = null;

              if (cell.isRevealed) {
                cellClass += ' revealed';
                if (cell.isMine) {
                  cellClass += ' mine';
                  content = <i className="fa-solid fa-bug" />;
                } else if (cell.neighborMines > 0) {
                  cellClass += ` count-${cell.neighborMines}`;
                  content = cell.neighborMines;
                }
              } else if (cell.isFlagged) {
                cellClass += ' flagged';
                content = <i className="fa-solid fa-shield-halved" />;
              }

              return (
                <button
                  key={`${r}-${c}`}
                  className={cellClass}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleToggleFlag(r, c);
                  }}
                  disabled={cell.isRevealed}
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
      </div>

      {(gameOver || gameWon) && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <strong
            style={{
              color: gameWon ? 'var(--accent-color)' : 'var(--arbyy-error)',
              fontSize: '1.1rem',
            }}
          >
            {gameWon
              ? lang === 'cs'
                ? '🏆 Firewall zabezpečen! Všechny hrozby neutralizovány!'
                : '🏆 Firewall Secured! All threats neutralized!'
              : lang === 'cs'
              ? '💥 Detekována malware mina! Systém kompromitován.'
              : '💥 Malware mine triggered! System compromised.'}
          </strong>
        </div>
      )}
    </div>
  );
};
