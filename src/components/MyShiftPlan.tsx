import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import apiService from "../services/api";
import { Company, MyShiftPlanResponse } from "../types";
import { addDays, isOvernight, weekDays, weekStart } from "../utils/shiftPlan";

interface MyShiftPlanProps {
  onBack: () => void;
  userEmail: string;
  userPassword: string;
  companies: Company[];
}

const NAV_BUTTON_CLASS =
  "px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors";

const MyShiftPlan: React.FC<MyShiftPlanProps> = ({
  onBack,
  userEmail,
  userPassword,
  companies,
}) => {
  const { t, i18n } = useTranslation();
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [start, setStart] = useState(() => weekStart(new Date()));
  const [plan, setPlan] = useState<MyShiftPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      setPlan(
        await apiService.getMyShiftPlan(
          userEmail,
          userPassword,
          companyId,
          start,
          addDays(start, 6),
        ),
      );
    } catch (err) {
      setPlan(null);
      setError(err instanceof Error ? err.message : t("shiftPlan.loadError"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, userPassword, companyId, start]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const days = weekDays(start, plan);
  const hasShifts = days.some((d) => d.shifts.length > 0);
  const formatDay = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(i18n.language, options);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t("common.backToMenu")}
      </button>

      <h3 className="text-lg font-semibold text-gray-900">{t("shiftPlan.title")}</h3>

      {companies.length > 1 && (
        <div>
          <label htmlFor="shift-plan-company" className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.company")}
          </label>
          <select
            id="shift-plan-company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setStart(addDays(start, -7))} className={NAV_BUTTON_CLASS}>
          {t("shiftPlan.previousWeek")}
        </button>
        <span className="text-sm font-medium text-gray-700 text-center">
          {formatDay(start, { day: "numeric", month: "short" })}
          {" – "}
          {formatDay(addDays(start, 6), { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <button onClick={() => setStart(addDays(start, 7))} className={NAV_BUTTON_CLASS}>
          {t("shiftPlan.nextWeek")}
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm text-center py-8">{t("common.loading")}</p>}

      {!loading && error && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 flex items-start" role="alert">
          <span>{error}</span>
          <button onClick={loadPlan} className="ml-auto text-red-700 underline text-xs flex-shrink-0">
            {t("common.retry")}
          </button>
        </div>
      )}

      {!loading && !error && !hasShifts && (
        <p className="text-gray-500 text-sm text-center py-8">{t("shiftPlan.empty")}</p>
      )}

      {!loading && !error && hasShifts && (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {days.map((day) => (
            <li key={day.date} className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 capitalize">
                {formatDay(day.date, { weekday: "long", day: "numeric", month: "short" })}
              </p>
              {day.shifts.length === 0 ? (
                <p className="text-xs text-gray-400 mt-1">{t("shiftPlan.dayOff")}</p>
              ) : (
                day.shifts.map((shift) => (
                  <div key={`${shift.start_time}-${shift.end_time}`} className="flex items-center gap-2 mt-1">
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0 border border-gray-300"
                      style={{ backgroundColor: shift.color ?? "#e5e7eb" }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-800">
                      {shift.start_time} – {shift.end_time}
                      {isOvernight(shift) && (
                        <span className="text-xs text-gray-500"> ({t("shiftPlan.nextDay")})</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {shift.name ?? t("shiftPlan.custom")}
                      {shift.break_minutes > 0 &&
                        ` · ${t("shiftPlan.break", { minutes: shift.break_minutes })}`}
                    </span>
                  </div>
                ))
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyShiftPlan;
