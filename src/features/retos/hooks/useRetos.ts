"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Categoria, Reto } from "../domain/reto";
import type { Pagination } from "../../common/domain/pagination";
import { retosService } from "../services/retos.service";
export function useRetos(q: string, categoriaId: number | undefined, page: number, limit: number) {
 const [items, setItems] = useState<Reto[]>([]);
 const [categories, setCategories] = useState<Categoria[]>([]);
 const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, total: 0, totalPages: 0, limit });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [categoriesError, setCategoriesError] = useState<string | null>(null);
 const version = useRef(0);
 const reload = useCallback(async () => {
  const request = ++version.current;
  setLoading(true); setError(null); setCategoriesError(null);
  try {
   const [result, categoriesResult] = await Promise.allSettled([retosService.list({ q, categoriaId, page, limit }), retosService.categories()]);
   if (request !== version.current) return;
   if (result.status === "fulfilled") {
    setItems(result.value.data); setPagination(result.value.pagination);
   } else {
    setError(result.reason instanceof Error ? result.reason.message : "No se pudieron cargar los retos.");
   }
   if (categoriesResult.status === "fulfilled") {
    setCategories(categoriesResult.value);
   } else {
    setCategories([]);
    setCategoriesError("Las categorías no están disponibles temporalmente. Puedes consultar los retos; para guardar, reintenta cargar las categorías.");
   }
  } catch (error) {
   if (request === version.current) setError(error instanceof Error ? error.message : "No se pudieron cargar los retos y categorías.");
  } finally { if (request === version.current) setLoading(false); }
 }, [q, categoriaId, page, limit]);
 const invalidate = useCallback(() => { version.current++; }, []);
 useEffect(() => {
  const timer = setTimeout(() => void reload(), 250);
  return () => { clearTimeout(timer); invalidate(); };
 }, [reload, invalidate]);
 return { items, categories, pagination, loading, error, categoriesError, reload };
}
