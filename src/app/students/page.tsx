"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Student = {
  id: string;
  fullName: string;
  phone: string | null;
  parentName: string | null;
  defaultRate: number | null;
  status: string;
  grade: number | null;
  groupStudents?: any[];
};

export default function StudentsPage() {
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [activeTab, setActiveTab] = useState<"students" | "graduates">("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    phone: "",
    defaultRate: "",
  });

  const loadStudents = async () => {
    const res = await fetch("/api/students/all");
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const createStudent = async () => {
    if (!studentForm.fullName.trim()) return;

    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentForm),
    });

    setStudentForm({
      fullName: "",
      phone: "",
      defaultRate: "",
    });

    setIsOpen(false);
    await loadStudents();
  };

const visibleByStatusStudents = students.filter((student) => {
  if (activeTab === "graduates") {
    return student.status === "FINISHED";
  }

  return student.status !== "FINISHED";
});

const filteredStudents = visibleByStatusStudents.filter((student) => {
  const matchesSearch =
    student.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (student.phone || "").toLowerCase().includes(search.toLowerCase());

  const matchesGrade =
    gradeFilter === "all"
      ? true
      : gradeFilter === "below10"
      ? student.grade !== null && student.grade < 10
      : student.grade === Number(gradeFilter);

  const isInGroup = (student.groupStudents?.length || 0) > 0;

  const matchesGroup =
    groupFilter === "all"
      ? true
      : groupFilter === "inGroup"
      ? isInGroup
      : !isInGroup;

  return matchesSearch && matchesGrade && matchesGroup;
});

const gridClass = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
}[columns];

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ученики</h1>
          <p className="text-gray-500 mt-1">
            База учеников, контакты и карточки
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
        >
          + Добавить ученика
        </button>
      </div>

      {/* ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК */}
      <div className="flex gap-2 rounded-2xl bg-white p-1 shadow-sm border border-gray-100 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`rounded-xl px-4 py-2 text-sm transition ${
            activeTab === "students"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Ученики
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("graduates")}
          className={`rounded-xl px-4 py-2 text-sm transition ${
            activeTab === "graduates"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Выпускники
        </button>
      </div>

      <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
          placeholder="Поиск по ФИО или телефону"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="all">Все классы</option>
          <option value="11">11 класс</option>
          <option value="10">10 класс</option>
          <option value="below10">Ниже 10 класса</option>
        </select>

        <select
          className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="all">Все ученики</option>
          <option value="inGroup">Состоит в группе</option>
          <option value="withoutGroup">Без группы</option>
        </select>
      </section>

      {/* ПЕРЕКЛЮЧАТЕЛЬ КОЛИЧЕСТВА УЧЕНИКОВ В  */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeTab === "graduates" ? "Выпускники" : "Ученики"}
        </h2>

        <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-sm border border-gray-100">
          {[2, 3, 4].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setColumns(value as 2 | 3 | 4)}
              className={`rounded-xl px-3 py-1.5 text-sm transition ${
                columns === value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {value} в ряд
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm">
            <div className="text-lg font-medium mb-2">
              {activeTab === "graduates"
                ? "Выпускников пока нет"
                : "Пока нет учеников"}
            </div>
            <div className="text-sm">
              Нажми "Добавить ученика", чтобы начать
            </div>
          </div>
        )}

        {/* ВЫВОД КАРТОЧКИ УЧЕНИКОВ */}
        <div className={`grid gap-4 ${gridClass}`}>
          {filteredStudents.map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                      {student.fullName[0]}
                    </div>

                    <div>
                      <div className="font-medium text-lg">{student.fullName}</div>
                        <div className="text-sm text-gray-500">
                          {student.phone || "телефон не указан"}
                        </div>
                    </div>

                  </div>
                    <div className="text-sm text-gray-500">
                      {student.phone || "нет телефона"}
                    </div>

                    <div className="text-sm text-gray-500">
                        {student.grade ? `${student.grade} класс` : "класс не указан"}
                    </div>

                </div>

                <div className="text-sm text-gray-600">
                  {student.defaultRate ? `${student.defaultRate} ₽` : "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in fade-in zoom-in">
            <div>
              <h2 className="text-xl font-semibold">Новый ученик</h2>
              <p className="text-sm text-gray-500 mt-1">
                Основные данные можно будет дополнить в карточке ученика
              </p>
            </div>

            <input
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              placeholder="ФИО"
              value={studentForm.fullName}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  fullName: e.target.value,
                })
              }
            />

            <input
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              placeholder="Телефон"
              value={studentForm.phone}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  phone: e.target.value,
                })
              }
            />

            <input
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              placeholder="Ставка"
              value={studentForm.defaultRate}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  defaultRate: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
              >
                Отмена
              </button>

              <button
                onClick={createStudent}
                className="bg-black text-white px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}