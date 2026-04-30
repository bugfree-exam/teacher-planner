"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    const res = await fetch(`/api/analytics?period=${period}`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, [period]);

  if (!data) {
    return <main className="p-8">Загрузка...</main>;
  }

  const maxByDate = Math.max(
    ...data.incomeByDate.map((i: any) => i.amount),
    1
  );

  const maxByStudent = Math.max(
    ...data.incomeByStudent.map((i: any) => i.amount),
    1
  );

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-gray-500 mt-1">
            Доходы, начисления и динамика занятий
          </p>
        </div>

        <select
          className="border border-gray-200 rounded-xl p-3 bg-white"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="day">Сегодня</option>
          <option value="week">Эта неделя</option>
          <option value="month">Этот месяц</option>
        </select>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Начислено</div>
          <div className="text-3xl font-bold mt-2">
            {data.totalAccrued} ₽
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Получено оплат</div>
          <div className="text-3xl font-bold mt-2">
            {data.totalReceived} ₽
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Проведено занятий</div>
          <div className="text-3xl font-bold mt-2">
            {data.lessonsCount}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Платежей</div>
          <div className="text-3xl font-bold mt-2">
            {data.paymentsCount}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Доход по дням</h2>

          <div className="space-y-3">
            {data.incomeByDate.length === 0 && (
              <div className="text-gray-500">Нет проведённых занятий</div>
            )}

            {data.incomeByDate.map((item: any) => (
              <div key={item.date}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{new Date(item.date).toLocaleDateString("ru-RU")}</span>
                  <span className="font-semibold">{item.amount} ₽</span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{
                      width: `${(item.amount / maxByDate) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Доход по ученикам</h2>

          <div className="space-y-3">
            {data.incomeByStudent.length === 0 && (
              <div className="text-gray-500">Нет данных по ученикам</div>
            )}

            {data.incomeByStudent.map((item: any) => (
              <div key={item.student}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.student}</span>
                  <span className="font-semibold">{item.amount} ₽</span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{
                      width: `${(item.amount / maxByStudent) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}