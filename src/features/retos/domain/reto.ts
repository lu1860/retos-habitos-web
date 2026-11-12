export interface Reto {
 id: number; nombre: string; descripcion: string; imagenUrl: string | null;
 duracionDias: number; esOficial: boolean; categoriaId: number; creadorId: number;
 status: "ACTIVE" | "INACTIVE"; createdAt: string; updatedAt: string;
}
export interface Categoria { id: number; nombre: string }
export type RetoInput = Pick<Reto, "nombre" | "descripcion" | "duracionDias" | "categoriaId"> & { imagen?: File };
export interface Participacion { id: number; usuarioId: number; retoId: number; fechaUnion: string; status: "ACTIVE" | "INACTIVE" }
export type Membership = "unknown" | "joined" | "left";
export interface ParticipacionConReto {participacion: Participacion;reto: Reto;}
