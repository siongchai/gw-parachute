"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { audioManager } from "@/audio/AudioManager";
import { GameCanvas } from "@/components/GameCanvas";
import { GameOver } from "@/components/GameOver";
import { Handheld } from "@/components/Handheld";
import { HighScores } from "@/components/HighScores";
import { HowToPlay } from "@/components/HowToPlay";
import { MainMenu } from "@/components/MainMenu";
import { SaveScoreModal } from "@/components/SaveScoreModal";
import type { AppScreen, GameMode } from "@/game/GameConfig";
import type { EngineCallbacks, EngineSnapshot, GameEngine } from "@/game/GameEngine";
import {
  getBestScore,
  getPlayerName,
  getSoundEnabled,
  saveLocalScore,
  setBestScore,
  setPlayerName,
  setSoundEnabled,
} from "@/lib/storage";
import { cleanPlayerName, submitHighScore } from "@/lib/scores";

const IDLE: EngineSnapshot = {
  score: 0,
  misses: 0,
  mode: "A",
  playing: false,
  paused: false,
  gameOver: false,
  newHighScore: false,
  tier: "Easy",
};

export function GameShell() {
  const engineRef = useRef<GameEngine | null>(null);
  const modeRef = useRef<GameMode>("A");
  const screenRef = useRef<AppScreen>("MENU");

  const [screen, setScreen] = useState<AppScreen>("MENU");
  const [snap, setSnap] = useState<EngineSnapshot>(IDLE);
  const [soundOn, setSoundOn] = useState(true);
  const [playerName, setName] = useState("YOU");
  const [draftName, setDraftName] = useState("YOU");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [best, setBest] = useState(0);

  screenRef.current = screen;

  useEffect(() => {
    const enabled = getSoundEnabled();
    setSoundOn(enabled);
    audioManager.setEnabled(enabled);
    const name = getPlayerName();
    setName(name);
    setDraftName(name);
    setBest(getBestScore("A"));
  }, []);

  const callbacksRef = useRef<EngineCallbacks>({});
  callbacksRef.current = {
    onChange: (s) => setSnap(s),
    onCatch: () => audioManager.catch(),
    onMiss: () => audioManager.miss(),
    onGameOver: (score) => {
      audioManager.gameOver();
      setBestScore(modeRef.current, score);
      setBest(getBestScore(modeRef.current));
      setScreen("GAME_OVER");
    },
    onNewHighScore: () => audioManager.highScore(),
  };

  const engineCallbacks = useRef<EngineCallbacks>({
    onChange: (s) => callbacksRef.current.onChange?.(s),
    onCatch: () => callbacksRef.current.onCatch?.(),
    onMiss: () => callbacksRef.current.onMiss?.(),
    onGameOver: (score) => callbacksRef.current.onGameOver?.(score),
    onNewHighScore: () => callbacksRef.current.onNewHighScore?.(),
  }).current;

  const onEngineReady = useCallback((engine: GameEngine) => {
    engineRef.current = engine;
  }, []);

  const startGame = useCallback((mode: GameMode) => {
    modeRef.current = mode;
    const b = getBestScore(mode);
    setBest(b);
    audioManager.start();
    engineRef.current?.start(mode, b);
    setScreen("PLAYING");
  }, []);

  const stepBoat = useCallback((dir: "left" | "right") => {
    engineRef.current?.stepBoat(dir);
  }, []);

  const goMenu = useCallback(() => {
    engineRef.current?.stop();
    setScreen("MENU");
    setSnap(IDLE);
  }, []);

  const togglePause = useCallback(() => {
    if (screenRef.current === "PLAYING") {
      engineRef.current?.pause();
      setScreen("PAUSED");
    } else if (screenRef.current === "PAUSED") {
      engineRef.current?.resume();
      setScreen("PLAYING");
    }
  }, []);

  useEffect(() => {
    const isLeft = (k: string) => k === "ArrowLeft" || k === "a" || k === "A";
    const isRight = (k: string) => k === "ArrowRight" || k === "d" || k === "D";

    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        togglePause();
        return;
      }
      if (isLeft(e.key)) {
        e.preventDefault();
        stepBoat("left");
      } else if (isRight(e.key)) {
        e.preventDefault();
        stepBoat("right");
      }
    };

    window.addEventListener("keydown", down, { passive: false });
    return () => {
      window.removeEventListener("keydown", down);
    };
  }, [stepBoat, togglePause]);

  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest?.(".handheld")) e.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    audioManager.setEnabled(next);
    audioManager.button();
  };

  const confirmSave = async () => {
    if (saveBusy) return;
    const cleaned = cleanPlayerName(draftName);
    setPlayerName(cleaned);
    setName(cleaned);
    setSaveBusy(true);
    setSaveError(null);

    saveLocalScore({
      player_name: cleaned,
      score: snap.score,
      game_mode: modeRef.current,
      created_at: new Date().toISOString(),
    });
    setBest(getBestScore(modeRef.current));

    try {
      await submitHighScore({
        player_name: cleaned,
        score: snap.score,
        game_mode: modeRef.current,
      });
      setSaveOpen(false);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "not-configured") {
        setSaveOpen(false);
      } else {
        setSaveError("SAVED ON DEVICE. CLOUD SAVE FAILED.");
      }
    } finally {
      setSaveBusy(false);
      audioManager.button();
    }
  };

  const click = (fn: () => void) => () => {
    audioManager.button();
    fn();
  };

  let overlay: React.ReactNode = null;
  if (screen === "MENU") {
    overlay = (
      <MainMenu
        soundOn={soundOn}
        onPlayA={click(() => startGame("A"))}
        onPlayB={click(() => startGame("B"))}
        onHighScores={click(() => setScreen("HIGH_SCORES"))}
        onHowTo={click(() => setScreen("HOW_TO_PLAY"))}
        onToggleSound={toggleSound}
      />
    );
  } else if (screen === "HOW_TO_PLAY") {
    overlay = <HowToPlay onBack={click(() => setScreen("MENU"))} />;
  } else if (screen === "HIGH_SCORES") {
    overlay = <HighScores playerName={playerName} onBack={click(() => setScreen("MENU"))} />;
  } else if (screen === "GAME_OVER") {
    overlay = (
      <GameOver
        score={snap.score}
        best={Math.max(best, snap.score)}
        newHighScore={snap.newHighScore}
        onAgain={click(() => startGame(modeRef.current))}
        onSave={click(() => {
          setDraftName(playerName);
          setSaveError(null);
          setSaveOpen(true);
        })}
        onMenu={click(goMenu)}
      />
    );
  } else if (screen === "PAUSED") {
    overlay = (
      <div className="panel pause">
        <div className="rule-heading">
          <span className="rule" />
          <h2>PAUSED</h2>
          <span className="rule" />
        </div>
        <div className="panel-buttons">
          <button type="button" className="btn btn-red" onClick={click(togglePause)}>
            RESUME
          </button>
          <button type="button" className="btn btn-tan" onClick={click(goMenu)}>
            MAIN MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <Handheld
        screen={<GameCanvas callbacks={engineCallbacks} onReady={onEngineReady} />}
        overlay={overlay}
        onStepLeft={() => stepBoat("left")}
        onStepRight={() => stepBoat("right")}
        onGameA={click(() => startGame("A"))}
        onGameB={click(() => startGame("B"))}
        onTime={click(() => (screen === "MENU" ? setScreen("HIGH_SCORES") : goMenu()))}
      />

      <SaveScoreModal
        open={saveOpen}
        name={draftName}
        busy={saveBusy}
        error={saveError}
        onChange={setDraftName}
        onConfirm={() => {
          void confirmSave();
        }}
        onCancel={() => {
          if (saveBusy) return;
          setSaveOpen(false);
          setSaveError(null);
        }}
      />
    </div>
  );
}
