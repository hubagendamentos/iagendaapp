import { useState, useEffect, useRef, useCallback } from "react";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useCronometro(appointmentId: string | undefined) {
  const key = appointmentId ? `crono_${appointmentId}` : null;

  const getInitial = useCallback((): { rodando: boolean; startedAt: number | null } => {
    if (!key) return { rodando: false, startedAt: null };
    const raw = localStorage.getItem(key);
    if (!raw) return { rodando: false, startedAt: null };
    try {
      return JSON.parse(raw);
    } catch {
      return { rodando: false, startedAt: null };
    }
  }, [key]);

  const [state, setState] = useState(getInitial);
  const [decorrido, setDecorrido] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.rodando && prev.startedAt) {
        setDecorrido(Math.floor((Date.now() - prev.startedAt) / 1000));
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (state.rodando && state.startedAt) {
      setDecorrido(Math.floor((Date.now() - state.startedAt) / 1000));
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.rodando, state.startedAt, tick]);

  const persist = useCallback(
    (s: { rodando: boolean; startedAt: number | null }) => {
      if (key) localStorage.setItem(key, JSON.stringify(s));
    },
    [key]
  );

  const iniciar = useCallback(() => {
    const now = Date.now();
    const next = { rodando: true, startedAt: now };
    setState(next);
    persist(next);
    setDecorrido(0);
  }, [persist]);

  const parar = useCallback(() => {
    const next = { rodando: false, startedAt: state.startedAt };
    setState(next);
    persist(next);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [persist, state.startedAt]);

  return {
    iniciar,
    parar,
    formatado: formatTime(decorrido),
    decorrido,
    rodando: state.rodando,
  };
}