
import Link from "next/link";
import { WeekStrip } from "@/src/features/common/components/WeekStrip";

const beneficios = [
  {
    numero: "01",
    titulo: "Elige tu reto",
    descripcion:
      "Encuentra pequeños desafíos que se adapten a tus objetivos y a tu ritmo.",
  },
  {
    numero: "02",
    titulo: "Registra tu día",
    descripcion:
      "Marca cada día que cumplas tu hábito y construye una rutina constante.",
  },
  {
    numero: "03",
    titulo: "Celebra tu progreso",
    descripcion:
      "Observa tus avances y descubre lo que puedes conseguir con constancia.",
  },
];

const retos = [
  {
    categoria: "BIENESTAR",
    nombre: "8 vasos de agua al día",
    duracion: "21 días",
    descripcion: "Haz de la hidratación una parte natural de tu rutina.",
    icono: "◉",
  },
  {
    categoria: "MOVIMIENTO",
    nombre: "Caminar 20 minutos",
    duracion: "30 días",
    descripcion: "Regálate un momento para moverte y conectar contigo.",
    icono: "↗",
  },
  {
    categoria: "CRECIMIENTO",
    nombre: "Leer 15 minutos",
    duracion: "14 días",
    descripcion: "Dedica unos minutos diarios a alimentar tu mente.",
    icono: "▤",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1 overflow-hidden bg-mist">

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28 lg:px-10">

        <div className="flex flex-col items-start gap-7">

          <span className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-bold tracking-[0.18em] text-water-dark">
            CRECE A TU PROPIO RITMO
          </span>

          <h1 className="font-display text-5xl leading-[1.12] font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Cada pequeño hábito
            <span className="mt-2 block text-water">
              transforma tu día.
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-8 text-muted">
            Los grandes cambios comienzan con pequeñas decisiones.
            Únete a retos de hábitos, comparte el camino con otras
            personas y celebra cada avance.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="rounded-xl bg-ink px-7 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-ink-soft"
            >
              Comenzar ahora →
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-line bg-surface px-7 py-4 font-bold text-ink transition hover:border-water"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <p className="text-sm text-muted">
            Pequeños pasos, constancia y crecimiento personal.
          </p>
        </div>

        {/* TARJETA VISUAL DE PROGRESO */}
        <div className="relative mx-auto w-full max-w-lg">

          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[#E9E8D9] blur-2xl" />
          <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-[#DCE7D9] blur-2xl" />

          <div className="relative rounded-[2rem] border border-white bg-ink p-7 text-white shadow-2xl sm:p-10">

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/70">
                TU PROGRESO DIARIO
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                Ejemplo
              </span>
            </div>

            <div className="mt-9">
              <p className="text-sm text-white/70">
                Un hábito a la vez
              </p>

              <h2 className="mt-2 font-display text-3xl font-bold">
                8 vasos de agua
              </h2>

              <p className="mt-2 text-sm text-white/65">
                La constancia se construye día a día.
              </p>
            </div>

            <div className="mt-9 rounded-2xl bg-white/10 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  Tu semana
                </span>
                <span className="text-sm font-bold text-[#E5B77F]">
                  5 de 7 días
                </span>
              </div>

              <div className="mt-5">
                <WeekStrip done={5} />
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-6">
              <div>
                <p className="text-3xl font-bold text-[#E5B77F]">
                  21
                </p>
                <p className="mt-1 text-xs text-white/65">
                  Días de reto
                </p>
              </div>

              <div className="text-right">
                <p className="font-display text-lg font-bold">
                  Sigue creciendo
                </p>
                <p className="mt-1 text-xs text-white/65">
                  Cada día cuenta.
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#E9E8D9] text-xl text-ink">
              ✳
            </span>

            <div>
              <p className="font-bold text-ink">
                Tu proceso importa
              </p>
              <p className="text-sm text-muted">
                Avanza sin compararte con los demás.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FRASE DESTACADA */}
      <section className="border-y border-line bg-[#E9E8D9] px-6 py-16 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-water-dark">
          UNA NUEVA FORMA DE CRECER
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl leading-snug font-bold text-ink sm:text-4xl">
          No necesitas cambiarlo todo hoy.
          Solo necesitas comenzar.
        </h2>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">

        <div className="max-w-2xl">
          <p className="text-xs font-bold tracking-[0.2em] text-water-dark">
            EMPIEZA CON ALGO PEQUEÑO
          </p>

          <h2 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">
            Construir hábitos puede ser más sencillo.
          </h2>

          <p className="mt-5 leading-7 text-muted">
            Te acompañamos en cada etapa para que puedas
            transformar tus pequeñas acciones en grandes logros.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {beneficios.map((beneficio) => (
            <article
              key={beneficio.numero}
              className="rounded-3xl border border-line bg-surface p-8 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="font-display text-4xl font-bold text-[#B4C5AE]">
                {beneficio.numero}
              </span>

              <h3 className="mt-8 font-display text-2xl font-bold text-ink">
                {beneficio.titulo}
              </h3>

              <p className="mt-4 leading-7 text-muted">
                {beneficio.descripcion}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* RETOS */}
      <section className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-water-dark">
                ENCUENTRA TU CAMINO
              </p>

              <h2 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">
                Retos para cada día.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-muted">
                Descubre nuevas formas de cuidar de ti y construir
                rutinas que puedas mantener.
              </p>
            </div>

            <Link
              href="/register"
              className="font-bold text-water-dark transition hover:text-ink"
            >
              Explorar retos →
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {retos.map((reto) => (
              <article
                key={reto.nombre}
                className="group overflow-hidden rounded-3xl border border-line bg-mist transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-40 items-center justify-center bg-[#E9E8D9]">
                  <span className="font-display text-7xl text-water-dark transition group-hover:scale-110">
                    {reto.icono}
                  </span>
                </div>

                <div className="p-7">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-wider text-water-dark">
                      {reto.categoria}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                      {reto.duracion}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-ink">
                    {reto.nombre}
                  </h3>

                  <p className="mt-3 min-h-14 text-sm leading-6 text-muted">
                    {reto.descripcion}
                  </p>

                  <Link
                    href="/register"
                    className="mt-6 inline-flex font-bold text-water-dark transition hover:text-ink"
                  >
                    Quiero comenzar →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LLAMADO FINAL */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] bg-ink px-7 py-16 text-center text-white sm:px-12">

          <p className="text-xs font-bold tracking-[0.2em] text-[#D9A66F]">
            TU SIGUIENTE PASO COMIENZA HOY
          </p>

          <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight font-bold sm:text-5xl">
            Cultiva hábitos que te acerquen a tu mejor versión.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-white/70">
            Únete a nuestra comunidad y comienza a construir
            cambios positivos un día a la vez.
          </p>

          <Link
            href="/register"
            className="mt-9 inline-flex rounded-xl bg-[#D9A66F] px-8 py-4 font-bold text-ink transition hover:bg-[#E8BD8D]"
          >
            Crear mi cuenta →
          </Link>
        </div>
      </section>


    </main>
  );
}
