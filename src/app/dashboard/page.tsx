"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [balanceFilter, setBalanceFilter] = useState<"debt" | "ok">("debt");

  const loadData = async () => {
    const dashboardData = await fetch("/api/dashboard").then((r) => r.json());
    setData(dashboardData);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
    return <main className="p-6">Загрузка...</main>;
  }

  const filteredBalances = data.balances.filter((student: any) => {
  if (balanceFilter === "debt") {
    return student.balance < 0;
  }

  return student.balance >= 0;
});

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-xl p-4 bg-white">
          <div className="text-sm text-gray-500">Занятий сегодня</div>
          <div className="text-3xl font-bold">{data.todayLessons.length}</div>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <div className="text-sm text-gray-500">Проведено за месяц</div>
          <div className="text-3xl font-bold">
            {data.monthStats.completedLessonsCount}
          </div>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <div className="text-sm text-gray-500">Начислено за месяц</div>
          <div className="text-3xl font-bold">
            {data.monthStats.earnedByLessons} ₽
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <div className="border rounded-xl p-4 bg-white">
          <h2 className="font-semibold mb-4">Сегодня</h2>

          <div className="space-y-2">
            {data.todayLessons.length === 0 && (
              <div className="text-gray-500">Сегодня занятий нет</div>
            )}

            {data.todayLessons.map((lesson: any) => (
              <div key={lesson.id} className="border rounded p-3">
                <div className="font-semibold">
                  {lesson.student?.fullName || lesson.group?.name || "Занятие"}
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(lesson.startsAt).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {lesson.durationMin} мин · {lesson.price} ₽
                </div>

                <div className="text-sm text-gray-500">{lesson.status}</div>
              </div>
            ))}
          </div>
        </div> */}


        <div className="border rounded-xl p-4 bg-white">
          <h2 className="font-semibold mb-4">Занимаются сегодня</h2>

          <div className="space-y-2">
            {data.todayLessons.length === 0 && (
              <div className="text-gray-500">Сегодня занятий нет</div>
            )}

            {data.todayLessons.map((lesson: any) => (
              <div
                key={lesson.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">
                    {lesson.studentName || lesson.groupName}
                  </div>

                  <div className="text-sm text-gray-500">
                    {lesson.grade ? `${lesson.grade} класс` : "группа"}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {lesson.time}
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="border rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold">Балансы учеников</h2>

            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setBalanceFilter("debt")}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  balanceFilter === "debt"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Должники
              </button>

              <button
                type="button"
                onClick={() => setBalanceFilter("ok")}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  balanceFilter === "ok"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Всё ок
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredBalances.length === 0 && (
              <div className="text-gray-500">
                {balanceFilter === "debt"
                  ? "Должников нет 🎉"
                  : "Пока нет учеников с положительным или нулевым балансом"}
              </div>
            )}

            {filteredBalances.map((student: any) => (
              <div
                key={student.studentId}
                className="border rounded p-3 flex justify-between"
              >
                <div>
                  <div className="font-semibold">{student.fullName}</div>
                  <div className="text-sm text-gray-500">
                    Оплачено: {student.paid} ₽ · Начислено: {student.charged} ₽
                  </div>
                </div>

                <div
                  className={
                    student.balance < 0
                      ? "font-bold text-red-600"
                      : "font-bold text-green-600"
                  }
                >
                  {student.balance} ₽
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}