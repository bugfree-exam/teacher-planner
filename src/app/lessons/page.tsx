"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  fullName: string;
};

type Lesson = {
  id: string;
  startsAt: string;
  durationMin: number;
  price: number;
  student?: Student;
};

export default function LessonsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [form, setForm] = useState({
    studentId: "",
    startsAt: "",
    durationMin: "60",
    price: "",
  });

  const loadData = async () => {
    const s = await fetch("/api/students").then((r) => r.json());
    const l = await fetch("/api/lessons").then((r) => r.json());

    setStudents(s);
    setLessons(l);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createLesson = async () => {
    await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    await loadData();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Занятия</h1>

      <div className="border p-4 rounded mb-6 space-y-2">
        <select
          className="border p-2 w-full"
          value={form.studentId}
          onChange={(e) =>
            setForm({ ...form, studentId: e.target.value })
          }
        >
          <option value="">Выбери ученика</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          className="border p-2 w-full"
          value={form.startsAt}
          onChange={(e) =>
            setForm({ ...form, startsAt: e.target.value })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Длительность (мин)"
          value={form.durationMin}
          onChange={(e) =>
            setForm({ ...form, durationMin: e.target.value })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="Цена"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        <button
          onClick={createLesson}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Создать занятие
        </button>
      </div>

      <div className="space-y-2">
        {lessons.map((l) => (
          <div key={l.id} className="border p-3 rounded">
            <div>
              {new Date(l.startsAt).toLocaleString()}
            </div>
            <div>{l.student?.fullName || "—"}</div>
            <div>{l.durationMin} мин</div>
            <div>{l.price} ₽</div>
          </div>
        ))}
      </div>
    </main>
  );
}