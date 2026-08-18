"use client";

import { useEffect, useRef } from "react";
import { GameEngine, type EngineCallbacks } from "@/game/GameEngine";

type Props = {
  callbacks: EngineCallbacks;
  onReady: (engine: GameEngine) => void;
};

export function GameCanvas({ callbacks, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const callbacksRef = useRef(callbacks);
  const onReadyRef = useRef(onReady);
  callbacksRef.current = callbacks;
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.setCallbacks({
      onChange: (s) => callbacksRef.current.onChange?.(s),
      onCatch: () => callbacksRef.current.onCatch?.(),
      onMiss: () => callbacksRef.current.onMiss?.(),
      onGameOver: (score) => callbacksRef.current.onGameOver?.(score),
      onNewHighScore: () => callbacksRef.current.onNewHighScore?.(),
    });
    void engine.init().then(() => onReadyRef.current(engine));

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="Parachute Rescue game screen"
    />
  );
}
