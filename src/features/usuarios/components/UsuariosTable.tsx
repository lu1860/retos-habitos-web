import type { Usuario } from "../domain/usuario";

const dateFormat = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

/** Tabla de usuarios. En celular se desplaza horizontalmente dentro de su contenedor. */
export function UsuariosTable({ usuarios }: { usuarios: Usuario[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">Usuarios registrados</caption>
        <thead className="border-b border-line bg-mist/60 text-ink-soft">
          <tr>
            <th scope="col" className="px-4 py-3 font-bold">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 font-bold">
              Email
            </th>
            <th scope="col" className="px-4 py-3 font-bold">
              Rol
            </th>
            <th scope="col" className="px-4 py-3 font-bold">
              Registro
            </th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-bold">{usuario.nombre}</td>
              <td className="px-4 py-3 text-ink-soft">{usuario.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    usuario.rol === "admin" ? "bg-sun/30 text-ink" : "bg-water/10 text-water-dark"
                  }`}
                >
                  {usuario.rol === "admin" ? "Admin" : "Participante"}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {dateFormat.format(new Date(usuario.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
