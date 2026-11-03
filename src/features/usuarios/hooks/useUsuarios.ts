"use client";
import { useEffect, useState } from "react";
import type { PaginatedResponse } from "../../common/domain/pagination";
import { getErrorMessage } from "../../common/services/api-error";
import type { Usuario, UsuariosQuery } from "../domain/usuario";
import { usuariosService } from "../services/usuarios.service";

interface UsuariosState {
  result: PaginatedResponse<Usuario> | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Lista paginada de usuarios con búsqueda. Expone los tres estados de la interfaz:
 * cargando (isLoading), error (error) y vacío (result.data.length === 0).
 */
export function useUsuarios() {
  const [query, setQuery] = useState<UsuariosQuery>({ page: 1, q: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<UsuariosState>({ result: null, error: null, isLoading: true });

  useEffect(() => {
    // Si la consulta cambia antes de que llegue la respuesta, la respuesta vieja se ignora
    let isCurrent = true;
    usuariosService
      .list(query)
      .then((result) => {
        if (isCurrent) setState({ result, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        if (isCurrent) setState({ result: null, error: getErrorMessage(error), isLoading: false });
      });
    return () => {
      isCurrent = false;
    };
  }, [query, reloadKey]);

  const startLoading = () => setState((current) => ({ ...current, error: null, isLoading: true }));

  return {
    ...state,
    query,
    /** Busca desde la primera página. */
    search: (q: string) => {
      startLoading();
      setQuery({ page: 1, q });
    },
    goToPage: (page: number) => {
      startLoading();
      setQuery((current) => ({ ...current, page }));
    },
    retry: () => {
      startLoading();
      setReloadKey((key) => key + 1);
    },
  };
}
