/** Formato de todas las listas que devuelve la API: { data, pagination }. */
export interface Pagination {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/** Respuesta de un solo recurso: { data }. */
export interface DataResponse<T> {
  data: T;
}
