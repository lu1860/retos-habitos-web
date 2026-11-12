
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "../../auth/hooks/useSession";
import { Loading } from "../../common/components/Loading";
import { Alert } from "../../common/components/Alert";
import { retosService } from "../../retos/services/retos.service";
import { registrosService } from "../../retos/services/registros.service";
import type { ParticipacionConReto } from "../../retos/domain/reto";
import { calcularPorcentajeProgreso } from "../../retos/domain/progreso";

interface RetoConProgreso extends ParticipacionConReto {
  totalDias: number;
  porcentaje: number;
}

export function DashboardParticipante() {
  const { user } = useSession();
  const [retos, setRetos] = useState<RetoConProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDashboard() {
      try {
        setLoading(true);
        setError("");

        const participaciones = await retosService.misParticipaciones();

        const resultados = await Promise.all(
          participaciones.map(async (item) => {
            const respuesta = await registrosService.progress(item.reto.id);
            const totalDias = respuesta.data.totalDias;

            return {
              ...item,
              totalDias,
              porcentaje: calcularPorcentajeProgreso(
                totalDias,
                item.reto.duracionDias,
              ),
            };
          }),
        );

        if (activo) setRetos(resultados);
      } catch (e) {
        if (activo) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo cargar tu información.",
          );
        }
      } finally {
        if (activo) setLoading(false);
      }
    }

    void cargarDashboard();

    return () => {
      activo = false;
    };
  }, []);

  if (!user) return null;

  const totalDias = retos.reduce((total, reto) => total + reto.totalDias, 0);

  return (
    <section className="flex flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-water-dark">
          Mi espacio personal
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          ¡Hola, {user.nombre}! 👋
        </h1>
        <p className="mt-2 text-muted">
          Cada pequeño hábito te acerca a una mejor versión de ti.
        </p>
      </header>

      {error && <Alert message={error} />}

      {loading ? (
        <Loading message="Preparando tu progreso..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-sm text-muted">Retos activos</p>
              <p className="mt-2 font-display text-4xl font-bold text-ink">
                {retos.length}
              </p>
            </article>

            <article className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-sm text-muted">Días registrados</p>
              <p className="mt-2 font-display text-4xl font-bold text-ink">
                {totalDias}
              </p>
            </article>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Mis retos actuales
              </h2>
              <p className="mt-1 text-sm text-muted">
                Sigue avanzando a tu propio ritmo.
              </p>
            </div>

            <Link
              href="/retos"
              className="font-bold text-water-dark hover:underline"
            >
              Explorar retos →
            </Link>
          </div>

          {retos.length === 0 ? (
            <article className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
              <h3 className="font-display text-xl font-bold text-ink">
                ¡Tu próximo hábito te está esperando!
              </h3>
              <p className="mt-2 text-muted">
                Todavía no estás participando en ningún reto.
              </p>
              <Link
                href="/retos"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-ink px-5 font-bold text-white hover:opacity-90"
              >
                Descubrir retos
              </Link>
            </article>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {retos.map((item) => (
                <article
                  key={item.participacion.id}
                  className="overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  {item.reto.imagenUrl && (
                    <img
                      src={item.reto.imagenUrl}
                      alt={item.reto.nombre}
                      className="h-44 w-full object-cover"
                    />
                  )}

                  <div className="flex flex-col gap-4 p-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-water-dark">
                        {item.reto.duracionDias} días
                      </p>
                      <h3 className="mt-1 font-display text-xl font-bold text-ink">
                        {item.reto.nombre}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {item.reto.descripcion}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">Tu progreso</span>
                        <span className="font-bold">{item.porcentaje}%</span>
                      </div>

                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-mist"
                        role="progressbar"
                        aria-valuenow={item.porcentaje}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progreso de ${item.reto.nombre}`}
                      >
                        <div
                          className="h-full rounded-full bg-water transition-all"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-muted">
                        {item.totalDias} de {item.reto.duracionDias} días registrados
                      </p>
                    </div>

                    <Link
                      href={`/retos?reto=${item.reto.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line font-bold text-ink hover:bg-mist"
                    >
                      Ver mi reto →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
