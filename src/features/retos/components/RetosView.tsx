"use client";
import { RetoImage } from "./RetoImage";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "../../auth/hooks/useSession";
import { ApiError } from "../../common/services/api-error";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";
import { Loading } from "../../common/components/Loading";
import { Pagination } from "../../common/components/Pagination";
import { type Reto, type RetoInput } from "../domain/reto";
import { useRetos } from "../hooks/useRetos";
import { retosService } from "../services/retos.service";
import { RetoCard } from "./RetoCard";
import { RetoForm } from "./RetoForm";
import { RetoParticipation } from "./RetoParticipation";
function ForbiddenNotice() {
  return useSearchParams().get("sinPermiso") === "1" ? (
    <Alert type="info" message="Esa sección es solo para administración." />
  ) : null;
}
type View = "list" | "detail" | "create" | "edit";
export function RetosView() {
  const { user, isAdmin } = useSession();
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const { items, categories, pagination, loading, error, categoriesError, reload } = useRetos(search, category ? Number(category) : undefined, page, limit);
  const [reto, setReto] = useState<Reto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailVersion = useRef(0);
  const loadDetail = async (id: number) => {
    const request = ++detailVersion.current;
    setDetailLoading(true); setDetailError(null); setReto(null);
    try { const result = await retosService.detail(id); if (request === detailVersion.current) setReto(result); }
    catch (error) { if (request === detailVersion.current) setDetailError(error instanceof Error ? error.message : "No se pudo cargar el detalle."); }
    finally { if (request === detailVersion.current) setDetailLoading(false); }
  };
  const [busy, setBusy] = useState(false);
  const [participationPending, setParticipationPending] = useState(false);
  const participationLock = useRef(false);
  const onParticipationPending = useCallback((pending: boolean) => {
    participationLock.current = pending;
    setParticipationPending(pending);
  }, []);
  const operationPending = busy || participationPending;
  const [issue, setIssue] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const lock = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    section.current?.querySelector<HTMLElement>("h1, h2")?.focus();
  }, [view, reto?.id]);
  if (!user) return null;
  const canEdit = Boolean(reto && (isAdmin || reto.creadorId === user.id));
  const categoryName = (id: number) => categories.find((item) => item.id === id)?.nombre ?? "Categoría no disponible";
  const navigate = (next: View) => {
    if (participationLock.current) return;
    setIssue(null);
    setView(next);
  };
  const run = async (
    action: () => Promise<void>,
    message: string,
    next?: View,
  ) => {
    if (lock.current || participationLock.current) return;
    lock.current = true;
    setBusy(true);
    setIssue(null);
    setSuccess(null);
    try {
      await action();
      await reload();
      setSuccess(message);
      if (next) { setPage(1); setView(next); }
    } catch (error) {
      setIssue(
        error instanceof Error
          ? error instanceof ApiError ? [error.message, ...Object.values(error.details)].join(" · ") : error.message
          : "No se pudo completar la operación.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const save = (input: RetoInput) =>
    run(
      () =>
        retosService.save(input, view === "edit" ? (selected ?? undefined) : undefined).then((saved) => { setReto(saved); }),
      "Reto guardado.",
      "list",
    );
  return (
    <section
      ref={section}
      className="flex flex-col gap-6"
      aria-label="Retos de hábitos"
    >
      <Suspense fallback={null}>
        <ForbiddenNotice />
      </Suspense>
      {issue && <Alert message={issue} />}
      {success && <Alert type="success" message={success} />}
      {categoriesError && <div><Alert type="info" message={categoriesError} /><Button disabled={loading || busy} onClick={() => void reload()}>Reintentar categorías</Button></div>}
      {view !== "list" && error && <div><Alert message={error} /><Button disabled={loading || busy} onClick={() => void reload()}>Reintentar categorías y listado</Button></div>}
      {view === "list" && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 tabIndex={-1} className="font-display text-3xl font-bold">
                Retos en grupo
              </h1>
              <p className="mt-2 text-muted">
                Hola, {user.nombre}. Encuentra tu próximo pequeño hábito.
              </p>
            </div>
            <Button onClick={() => navigate("create")}>Crear reto</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="search-retos" className="font-bold">
                Buscar retos
              </label>
              <input
                id="search-retos"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Título o descripción"
                className="min-h-11 rounded-lg border border-line bg-surface px-3"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="filter-category" className="font-bold">
                Categoría
              </label>
              <select
                id="filter-category"
                disabled={loading || categories.length === 0}
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="min-h-11 rounded-lg border border-line bg-surface px-3"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex gap-3">Retos por página
            <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>
              {[6, 10, 25, 50].map((size) => <option key={size}>{size}</option>)}
            </select>
          </label>
          {loading ? (
            <Loading message="Cargando retos…" />
          ) : error ? (
            <div className="flex flex-col items-start gap-3">
              <Alert message={error} />
              <Button onClick={() => void reload()}>Reintentar</Button>
            </div>
          ) : (
            <>
              <p role="status" className="text-sm text-muted">
                {pagination.total} {pagination.total === 1 ? "reto encontrado" : "retos encontrados"}
              </p>
              {items.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                      <RetoCard
                        key={item.id}
                        reto={item}
                        categoryName={categoryName(item.categoriaId)}
                        onDetail={() => {
                          setSelected(item.id);
                          void loadDetail(item.id);
                          navigate("detail");
                        }}
                      />
                    ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
                  <p>No hay retos que coincidan con tu búsqueda.</p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setPage(1);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
      {(view === "create" || (view === "edit" && reto && canEdit)) && (
        <RetoForm
          key={view === "edit" ? selected : "new"}
          reto={view === "edit" ? reto ?? undefined : undefined}
          categories={categories}
          busy={busy || loading}
          onSave={save}
          onCancel={() => navigate(view === "edit" ? "detail" : "list")}
        />
      )}
      {view === "detail" && reto && (
        <article className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-8">
          <Button
            variant="ghost"
            className="self-start"
            onClick={() => navigate("list")}
            disabled={operationPending}
          >
            ← Volver a los retos
          </Button>
          <p className="font-bold text-water-dark">
            {categoryName(reto.categoriaId)} · {reto.duracionDias} días
          </p>
          <h1
            tabIndex={-1}
            className="break-words font-display text-3xl font-bold"
          >
            {reto.nombre}
          </h1>
          {reto.imagenUrl && (
            <RetoImage
              src={reto.imagenUrl}
              alt={`Imagen de ${reto.nombre}`}
              className="max-h-80 w-full rounded-xl object-contain"
            />
          )}
          <p className="whitespace-pre-wrap break-words">{reto.descripcion}</p>
          {reto.esOficial && <p>Reto oficial</p>}
          <RetoParticipation key={`${user.id}:${reto.id}`} retoId={reto.id} disabled={busy} onPendingChange={onParticipationPending} />
          <div className="flex flex-wrap gap-3">
            {canEdit && (
              <>
                <Button
                  variant="secondary"
                  disabled={operationPending}
                  onClick={() => navigate("edit")}
                >
                  Editar reto
                </Button>
                <Button
                  variant="danger"
                  disabled={operationPending}
                  onClick={() => { if (!participationLock.current) dialog.current?.showModal(); }}
                >
                  Eliminar reto
                </Button>
              </>
            )}
          </div>
        </article>
      )}
      {view === "detail" && detailLoading && <><Loading message="Cargando detalle…" /><Button onClick={() => navigate("list")}>Volver a los retos</Button></>}
      {view === "detail" && detailError && <><Alert message={detailError} /><Button onClick={() => selected && void loadDetail(selected)}>Reintentar detalle</Button><Button onClick={() => navigate("list")}>Volver a los retos</Button></>}
      {view !== "list" &&
        view !== "create" &&
        !detailLoading && !detailError && (!reto || (view === "edit" && !canEdit)) && (
          <>
            <Alert message="El reto no está disponible o no tienes permiso para editarlo." />
            <Button onClick={() => navigate("list")}>Volver a los retos</Button>
          </>
        )}
      <dialog
        ref={dialog}
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-line bg-surface p-6 text-ink backdrop:bg-ink/50"
      >
        <h2 id="delete-title" className="font-display text-2xl font-bold">
          ¿Eliminar este reto?
        </h2>
        <p id="delete-description" className="my-4 break-words">
          Se eliminará «{reto?.nombre}». Esta acción no se
          puede deshacer.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            autoFocus
            onClick={() => dialog.current?.close()}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={operationPending}
            onClick={() => {
              dialog.current?.close();
              if (!operationPending && !participationLock.current && reto && canEdit)
                void run(
                  () => retosService.remove(reto.id),
                  "Reto eliminado.",
                  "list",
                );
            }}
          >
            Confirmar eliminación
          </Button>
        </div>
      </dialog>
    </section>
  );
}
