import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (delta: number) => void) {
  const requestRef = useRef<number>(null);
  const previousTimeRef = useRef<number>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined && previousTimeRef.current !== null) {
        const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1); // Cap delta to 100ms
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Only run once
}
