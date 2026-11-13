/**
 * Utilidades puras de «Mis turnos». Las fechas son `YYYY-MM-DD` locales (sin
 * zona horaria), igual que en la API de planificación de turnos.
 */
import { MyShiftPlanResponse, WorkerPlannedShift } from "../types";

function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** Lunes de la semana que contiene `date`. */
export function weekStart(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toIso(d);
}

/** Termina al día siguiente (fin anterior o igual al inicio). */
export function isOvernight(shift: WorkerPlannedShift): boolean {
  return shift.end_time <= shift.start_time;
}

/** Los 7 días de la semana (lunes a domingo) con sus turnos publicados. */
export function weekDays(
  start: string,
  plan: MyShiftPlanResponse | null,
): { date: string; shifts: WorkerPlannedShift[] }[] {
  const byDate = new Map((plan?.days ?? []).map((d) => [d.date, d.shifts]));
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, shifts: byDate.get(date) ?? [] };
  });
}
