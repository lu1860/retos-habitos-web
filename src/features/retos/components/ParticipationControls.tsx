import type { Membership } from "../domain/reto";
import { Button } from "../../common/components/Button";

export function ParticipationControls({ state, busy, onJoin, onLeave }: {
  state: Membership;
  busy: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  return <>
    <p role="status">{state === "joined" ? "Participación confirmada." : state === "left" ? "Abandono confirmado." : "Participación desconocida. Puedes confirmar tu unión o solicitar abandonar el reto."}</p>
    <div className="flex flex-wrap gap-3">
      {state !== "joined" && <Button isLoading={busy} disabled={busy} onClick={onJoin}>Confirmar unión</Button>}
      {state !== "left" && <Button variant="secondary" disabled={busy} onClick={onLeave}>Abandonar reto</Button>}
    </div>
  </>;
}
