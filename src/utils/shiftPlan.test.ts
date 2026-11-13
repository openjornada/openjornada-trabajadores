import { describe, expect, it } from "vitest";
import { addDays, isOvernight, weekDays, weekStart } from "./shiftPlan";
import { MyShiftPlanResponse, WorkerPlannedShift } from "../types";

const shift = (start_time: string, end_time: string): WorkerPlannedShift => ({
  shift_type_id: "t1",
  name: "Mañana",
  short_code: "M",
  color: "#22c55e",
  start_time,
  end_time,
  break_minutes: 30,
});

const plan = (days: MyShiftPlanResponse["days"]): MyShiftPlanResponse => ({
  company_id: "c1",
  company_name: "ACME",
  start_date: "2026-11-09",
  end_date: "2026-11-15",
  days,
});

describe("weekStart", () => {
  it("devuelve el lunes de la semana, también desde el domingo", () => {
    expect(weekStart(new Date(2026, 10, 13))).toBe("2026-11-09"); // viernes
    expect(weekStart(new Date(2026, 10, 9))).toBe("2026-11-09"); // lunes
    expect(weekStart(new Date(2026, 10, 15))).toBe("2026-11-09"); // domingo
  });
});

describe("addDays", () => {
  it("cruza meses y años", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-28", 7)).toBe("2027-01-04");
    expect(addDays("2026-11-09", -7)).toBe("2026-11-02");
  });
});

describe("weekDays", () => {
  it("con turnos: los coloca en su día y deja vacíos los demás", () => {
    const days = weekDays(
      "2026-11-09",
      plan([{ date: "2026-11-10", shifts: [shift("06:00", "14:00")] }]),
    );
    expect(days).toHaveLength(7);
    expect(days[0]).toEqual({ date: "2026-11-09", shifts: [] });
    expect(days[1].shifts).toHaveLength(1);
    expect(days[6].date).toBe("2026-11-15");
  });

  it("sin turnos publicados: 7 días vacíos", () => {
    const days = weekDays("2026-11-09", plan([]));
    expect(days.every((d) => d.shifts.length === 0)).toBe(true);
    expect(weekDays("2026-11-09", null)).toHaveLength(7);
  });
});

describe("isOvernight", () => {
  it("detecta el turno nocturno", () => {
    expect(isOvernight(shift("22:00", "06:00"))).toBe(true);
    expect(isOvernight(shift("20:00", "00:00"))).toBe(true);
    expect(isOvernight(shift("06:00", "14:00"))).toBe(false);
  });
});
