import { useEffect, useMemo, useRef, useState } from 'react';
import Agentation from './components/Agentation';

const GAME_DURATION = 30;
const SPAWN_INTERVAL_MS = 850;
const TARGET_SIZE = 72;

const WEBHOOK_URL = 'https://api.consen.app/webhooks/agentation';
const KNOWN_METADATA = {
  project_id: 'prj_01kpmzamrhfn9b7hr7g6jfpq0h',
  task_id: 'TASK-52',
  chat_id: 'chat_01kpmz8g1rfp7rpb4jpp7qztd2',
  workspace_id: 'ws_01kf0b8vzse7rb8tf8s2r1sgxj'
};

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState({ x: 50, y: 50, id: 0 });
  const [flash, setFlash] = useState('');

  const arenaRef = useRef(null);

  const accuracyMultiplier = useMemo(() => Math.max(1, 1 + streak * 0.1), [streak]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const spawner = window.setInterval(() => {
      setTarget((prev) => ({ ...pickRandomPosition(), id: prev.id + 1 }));
    }, Math.max(350, SPAWN_INTERVAL_MS - streak * 20));

    return () => window.clearInterval(spawner);
  }, [isRunning, streak]);

  function pickRandomPosition() {
    if (!arenaRef.current) {
      return { x: 50, y: 50 };
    }

    const bounds = arenaRef.current.getBoundingClientRect();
    const xPx = Math.random() * (bounds.width - TARGET_SIZE);
    const yPx = Math.random() * (bounds.height - TARGET_SIZE);
    const x = (xPx / bounds.width) * 100;
    const y = (yPx / bounds.height) * 100;
    return { x, y };
  }

  function startGame() {
    setRound((prev) => prev + 1);
    setIsRunning(true);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setStreak(0);
    setFlash('');
    setTarget({ ...pickRandomPosition(), id: Date.now() });
  }

  function handleArenaClick(event) {
    if (!isRunning || event.target.dataset.role === 'target') {
      return;
    }

    setStreak(0);
    setScore((prev) => Math.max(0, prev - 1));
    setFlash('miss');
    window.setTimeout(() => setFlash(''), 180);
  }

  function handleTargetHit() {
    if (!isRunning) {
      return;
    }

    setStreak((prev) => prev + 1);
    setScore((prev) => {
      const next = prev + Math.ceil(2 * accuracyMultiplier);
      setBestScore((best) => Math.max(best, next));
      return next;
    });
    setFlash('hit');
    window.setTimeout(() => setFlash(''), 140);
    setTarget((prev) => ({ ...pickRandomPosition(), id: prev.id + 1 }));
  }

  async function submitFeedback({ message, rating }) {
    const payload = {
      ...KNOWN_METADATA,
      url: window.location.href,
      feedback: {
        rating,
        message,
        game: {
          score,
          best_score: bestScore,
          streak,
          round,
          time_left: timeLeft
        }
      }
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Feedback webhook failed (${response.status})`);
    }
  }

  return (
    <main className="app-shell">
      <section className="game-card">
        <header className="headline">
          <h1>Pulse Chase</h1>
          <p>Hit the moving pulse before the timer hits zero.</p>
        </header>

        <div className="stats">
          <div>
            <span>Time</span>
            <strong>{timeLeft}s</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>{streak}</strong>
          </div>
          <div>
            <span>Best</span>
            <strong>{bestScore}</strong>
          </div>
        </div>

        <div
          ref={arenaRef}
          className={`arena ${flash}`}
          onClick={handleArenaClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !isRunning) {
              startGame();
            }
          }}
          aria-label="Game arena"
        >
          {isRunning ? (
            <button
              key={target.id}
              data-role="target"
              className="target"
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              onClick={handleTargetHit}
              aria-label="Target"
            />
          ) : (
            <div className="overlay">
              <p>{timeLeft === 0 ? 'Round complete' : 'Ready?'}</p>
              <button onClick={startGame}>{timeLeft === 0 ? 'Play Again' : 'Start Round'}</button>
            </div>
          )}
        </div>

        <p className="hint">Miss clicks cost 1 point. Longer streaks increase hit value.</p>
      </section>

      <Agentation webhookUrl={WEBHOOK_URL} onSubmit={submitFeedback} />
    </main>
  );
}

export default App;
