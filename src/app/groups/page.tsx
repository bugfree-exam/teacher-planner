"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  fullName: string;
};

type GroupStudent = {
  student: Student;
};

type Group = {
  id: string;
  name: string;
  description: string | null;
  defaultRate: number | null;
  students: GroupStudent[];
  homeworks: {
    id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    status: string;
  }[];
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homeworkForms, setHomeworkForms] = useState<Record<string, {
  title: string;
  description: string;
  deadline: string;
  }>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    defaultRate: "",
  });

  const [selectedStudents, setSelectedStudents] = useState<Record<string, string>>({});

  const loadData = async () => {
    const groupsData = await fetch("/api/groups").then((r) => r.json());
    const studentsData = await fetch("/api/students").then((r) => r.json());

    setGroups(groupsData);
    setStudents(studentsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createGroupHomework = async (groupId: string) => {
  const form = homeworkForms[groupId];
  if (!form?.title?.trim()) return;

  await fetch("/api/homeworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...form,
      groupId,
    }),
  });

  setHomeworkForms({
    ...homeworkForms,
    [groupId]: { title: "", description: "", deadline: "" },
  });

    await loadData();
  };

  const createGroup = async () => {
    if (!form.name.trim()) return;

    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ name: "", description: "", defaultRate: "" });
    await loadData();
  };

  const addStudentToGroup = async (groupId: string) => {
    const studentId = selectedStudents[groupId];
    if (!studentId) return;

    await fetch("/api/groups/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, studentId }),
    });

    setSelectedStudents({ ...selectedStudents, [groupId]: "" });
    await loadData();
  };

  const removeStudentFromGroup = async (groupId: string, studentId: string) => {
    await fetch("/api/groups/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, studentId }),
    });

    await loadData();
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Группы</h1>

      <section className="border rounded-xl p-4 mb-8 bg-white">
        <h2 className="font-semibold mb-4">Создать группу</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border rounded p-2"
            placeholder="Название группы"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border rounded p-2"
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            className="border rounded p-2"
            placeholder="Ставка"
            value={form.defaultRate}
            onChange={(e) => setForm({ ...form, defaultRate: e.target.value })}
          />
        </div>

        <button
          onClick={createGroup}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Создать группу
        </button>
      </section>

      <section className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="border rounded-xl p-4 bg-white">
            <div className="flex justify-between mb-3">
              <div>
                <div className="font-bold text-lg">{group.name}</div>
                <div className="text-sm text-gray-500">
                  {group.description || "без описания"}
                </div>
              </div>

              <div className="font-semibold">
                {group.defaultRate ? `${group.defaultRate} ₽` : "ставка не указана"}
              </div>
            </div>

            <div className="mb-3">
              <div className="font-semibold mb-2">Ученики в группе</div>

              <div className="flex flex-wrap gap-2">
                {group.students.length === 0 && (
                  <span className="text-sm text-gray-500">Пока никого нет</span>
                )}

                {group.students.map((gs) => (
                  <div
                    key={gs.student.id}
                    className="border rounded-full px-3 py-1 text-sm flex items-center gap-2"
                  >
                    <span>{gs.student.fullName}</span>
                    <button
                      onClick={() =>
                        removeStudentFromGroup(group.id, gs.student.id)
                      }
                      className="text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="border rounded p-2 flex-1"
                value={selectedStudents[group.id] || ""}
                onChange={(e) =>
                  setSelectedStudents({
                    ...selectedStudents,
                    [group.id]: e.target.value,
                  })
                }
              >
                <option value="">Добавить ученика</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>

              <div className="mt-4 border-t pt-4">
                <div className="font-semibold mb-2">Домашние задания группы</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <input
                    className="border rounded p-2"
                    placeholder="Название ДЗ"
                    value={homeworkForms[group.id]?.title || ""}
                    onChange={(e) =>
                      setHomeworkForms({
                        ...homeworkForms,
                        [group.id]: {
                          ...(homeworkForms[group.id] || {
                            title: "",
                            description: "",
                            deadline: "",
                          }),
                          title: e.target.value,
                        },
                      })
                    }
                  />

                  <input
                    className="border rounded p-2"
                    placeholder="Описание / ссылка"
                    value={homeworkForms[group.id]?.description || ""}
                    onChange={(e) =>
                      setHomeworkForms({
                        ...homeworkForms,
                        [group.id]: {
                          ...(homeworkForms[group.id] || {
                            title: "",
                            description: "",
                            deadline: "",
                          }),
                          description: e.target.value,
                        },
                      })
                    }
                  />

                  <input
                    type="date"
                    className="border rounded p-2"
                    value={homeworkForms[group.id]?.deadline || ""}
                    onChange={(e) =>
                      setHomeworkForms({
                        ...homeworkForms,
                        [group.id]: {
                          ...(homeworkForms[group.id] || {
                            title: "",
                            description: "",
                            deadline: "",
                          }),
                          deadline: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <button
                  onClick={() => createGroupHomework(group.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
                >
                  Выдать ДЗ группе
                </button>

                {/* <div className="space-y-2">
                  {group.homeworks.length === 0 && (
                    <div className="text-sm text-gray-500">ДЗ для группы пока нет</div>
                  )}

                  {group.homeworks.map((homework) => (
                    <div key={homework.id} className="border rounded p-3">
                      <div className="font-semibold">{homework.title}</div>
                      {homework.description && (
                        <div className="text-sm text-gray-500">{homework.description}</div>
                      )}
                      <div className="text-sm text-gray-500">
                        Дедлайн:{" "}
                        {homework.deadline
                          ? new Date(homework.deadline).toLocaleDateString("ru-RU")
                          : "не указан"}
                      </div>
                    </div>
                  ))}
                </div> */}
              </div>

              <button
                onClick={() => addStudentToGroup(group.id)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Добавить
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}