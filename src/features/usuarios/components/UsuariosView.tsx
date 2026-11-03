"use client";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";
import { Loading } from "../../common/components/Loading";
import { Pagination } from "../../common/components/Pagination";
import { useUsuarios } from "../hooks/useUsuarios";
import { UsuariosTable } from "./UsuariosTable";

/** Vista de administración de usuarios: búsqueda, tabla, paginación y estados de la interfaz. */
export function UsuariosView() {
  const usuarios = useUsuarios();
  const [searchText, setSearchText] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    usuarios.search(searchText);
  };

  return (
    <section className="flex flex-col gap-6" aria-labelledby="titulo-usuarios">
      <div>
        <h2 id="titulo-usuarios" className="font-display text-2xl font-bold">
          Usuarios
        </h2>
        <p className="mt-1 text-muted">Personas registradas en la aplicación.</p>
      </div>

      <form
        role="search"
        onSubmit={handleSearch}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="buscar-usuario" className="text-sm font-bold">
            Buscar por nombre o email
          </label>
          <input
            id="buscar-usuario"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="min-h-11 rounded-lg border border-line bg-surface px-3.5 text-base"
          />
        </div>
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar
        </Button>
      </form>

      {usuarios.isLoading && <Loading message="Cargando usuarios…" />}

      {!usuarios.isLoading && usuarios.error && (
        <div className="flex flex-col items-start gap-3">
          <Alert message={usuarios.error} />
          <Button variant="secondary" onClick={usuarios.retry}>
            Intentar de nuevo
          </Button>
        </div>
      )}

      {!usuarios.isLoading && usuarios.result && usuarios.result.data.length === 0 && (
        <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-8 text-center text-muted">
          {usuarios.query.q
            ? `No hay usuarios que coincidan con "${usuarios.query.q}". Prueba con otro nombre o email.`
            : "Todavía no hay usuarios registrados."}
        </p>
      )}

      {!usuarios.isLoading && usuarios.result && usuarios.result.data.length > 0 && (
        <>
          <UsuariosTable usuarios={usuarios.result.data} />
          <Pagination pagination={usuarios.result.pagination} onPageChange={usuarios.goToPage} />
        </>
      )}
    </section>
  );
}
