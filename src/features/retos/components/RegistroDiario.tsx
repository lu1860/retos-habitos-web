
"use client";

import { useEffect, useState } from "react";
import { registrosService, type Registro } from "../services/registros.service";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";

export function RegistroDiario({ retoId }: { retoId: number }) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function cargar() {
    try {
      const result = await registrosService.list(retoId);
      setRegistros(result.data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar tus registros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, [retoId]);

  async function registrar() {
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await registrosService.create(retoId, nota);
      setNota("");
      setSuccess("¡Tu día quedó registrado!");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo registrar el día.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-line bg-mist p-5 sm:p-7">
      <h2 className="font-display text-2xl font-bold text-ink">
        Mi progreso diario
      </h2>
      <p className="mt-2 text-sm text-muted">
        Cada día cuenta. Registra cuando hayas cumplido tu hábito.
      </p>

      {error && <div className="mt-4"><Alert message={error} /></div>}
      {success && <div className="mt-4"><Alert type="success" message={success} /></div>}

      <label className="mt-5 block font-semibold" htmlFor="nota-registro">
        Nota del día (opcional)
      </label>
      <textarea
        id="nota-registro"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        maxLength={500}
        placeholder="¿Cómo te fue hoy con tu hábito?"
        className="mt-2 min-h-24 w-full rounded-xl border border-line bg-surface p-3"
      />

      <Button
        className="mt-4"
        disabled={busy || loading || nota.length > 500}
        onClick={() => void registrar()}
      >
        {busy ? "Registrando..." : "Registrar mi día"}
      </Button>

      <div className="mt-6 border-t border-line pt-5">
        <p className="font-bold text-ink">
          Días registrados: {registros.length}
        </p>
        {loading ? (
          <p className="mt-2 text-sm text-muted">Cargando historial...</p>
        ) : registros.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Todavía no tienes días registrados.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {registros.map((registro) => (
              <li key={registro.id} className="rounded-lg bg-surface p-3 text-sm">
                <span className="font-semibold">Día registrado #{registro.id}</span>
                {registro.nota && (
                  <p className="mt-1 text-muted">{registro.nota}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
