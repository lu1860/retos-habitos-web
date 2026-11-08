import Image from "next/image";
import type { Reto } from "../domain/reto";
import { Button } from "../../common/components/Button";
export function RetoCard({
  reto,
  categoryName,
  onDetail,
}: {
  reto: Reto;
  categoryName: string;
  onDetail: () => void;
}) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      {reto.imagenUrl ? (
        <Image
          unoptimized
          width={960}
          height={540}
          src={reto.imagenUrl}
          alt={`Imagen de ${reto.nombre}`}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div
          className="flex h-28 items-center justify-center bg-water/10 font-display text-xl font-bold text-water-dark"
          aria-hidden="true"
        >
          Un día a la vez
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-sm font-bold text-water-dark">
          {categoryName} · {reto.duracionDias} días
        </p>
        <h2 className="break-words font-display text-xl font-bold">
          {reto.nombre}
        </h2>
        <p className="line-clamp-3 break-words text-muted">
          {reto.descripcion}
        </p>
        {reto.esOficial && <p className="text-sm">Reto oficial</p>}
        <Button
          variant="secondary"
          className="mt-auto"
          onClick={onDetail}
          aria-label={`Ver detalle de ${reto.nombre}`}
        >
          Ver detalle
        </Button>
      </div>
    </article>
  );
}
