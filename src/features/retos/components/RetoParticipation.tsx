"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSession } from "../../auth/hooks/useSession";
import { sessionStore } from "../../auth/services/session.store";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";
import { retosService } from "../services/retos.service";
import { ParticipationControls } from "./ParticipationControls";

const serverSession = () => null;

type ParticipationProps = { retoId: number; disabled?: boolean; onPendingChange?: (pending: boolean) => void };

export function RetoParticipation({ retoId, disabled = false, onPendingChange }: ParticipationProps) {
  const { user, status } = useSession();
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, serverSession);
  // The existing store owns the token; participation never persists a copy.
  if (status === "loading") return <p role="status">Restaurando sesión…</p>;
  if (!user || status !== "authenticated") return <p role="status">Inicia sesión para consultar tu participación.</p>;
  return <ParticipationSession key={`${user.id}:${session?.token.accessToken ?? "context"}:${retoId}`} retoId={retoId} disabled={disabled} onPendingChange={onPendingChange} />;
}

function ParticipationSession({ retoId, disabled = false, onPendingChange }: ParticipationProps) {
  const [participa, setParticipa] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const active = useRef(false);
  const lock = useRef(false);
  useEffect(() => {
    let current = true;
    active.current = true;
    const token = sessionStore.getToken();
    void retosService.participation(retoId).then(value => {
      if (current && sessionStore.getToken() === token) setParticipa(value);
    }).catch((reason: unknown) => {
      if (current && sessionStore.getToken() === token) setError(reason instanceof Error ? reason.message : "Intenta de nuevo.");
    });
    return () => { current = false; active.current = false; };
  }, [retoId, attempt]);

  useEffect(() => () => { onPendingChange?.(false); }, [onPendingChange]);

  const change = async (join: boolean) => {
    if (lock.current || disabled || participa === null || participa === join) return;
    lock.current = true;
    onPendingChange?.(true);
    setBusy(true); setError(null);
    const token = sessionStore.getToken();
    const current = () => active.current && sessionStore.getToken() === token;
    try {
      if (join) await retosService.join(retoId);
      else await retosService.leave(retoId);
      if (current()) setParticipa(join);
    } catch (reason) {
      if (current()) setError(reason instanceof Error ? reason.message : "No se pudo actualizar la participación.");
    } finally {
      lock.current = false;
      if (current()) { setBusy(false); onPendingChange?.(false); }
    }
  };
  return <>
    {busy && <p role="status">Actualizando participación…</p>}
    {error && <Alert message={`No se pudo ${participa === null ? "consultar" : "actualizar"} tu participación. ${error}`} />}
    {participa === null ? error
      ? <Button onClick={() => { setError(null); setAttempt(value => value + 1); }}>Reintentar participación</Button>
      : <p role="status">Cargando participación…</p>
      : <ParticipationControls state={participa ? "joined" : "left"} busy={busy || disabled} onJoin={() => void change(true)} onLeave={() => void change(false)} />}
  </>;
}
