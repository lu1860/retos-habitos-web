import type { Membership } from "../domain/reto";
import { Button } from "../../common/components/Button";

export function ParticipationControls({ state, busy, onJoin, onLeave }: {
  state: Membership;
  busy: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  return <>
    <p role="status">{state === "joined" ? "Participación confirmada." : state === "left" ? "No participas en este reto." : "Participación desconocida."}</p>
    <div className="flex flex-wrap gap-3">
      {state === "left" && <Button isLoading={busy} disabled={busy} onClick={onJoin}>Confirmar unión</Button>}
      {state === "joined" && <Button variant="secondary" disabled={busy} onClick={onLeave}>Abandonar reto</Button>}
    </div>
  </>;
}
