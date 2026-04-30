"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StudentCardPage() {
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [homeworkForm, setHomeworkForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });   
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const [activeTab, setActiveTab] = useState<
    "main" | "finance" | "lessons" | "homework" | "notes"
  >("main");

  const [paymentForm, setPaymentForm] = useState({
  amount: "",
  paidAt: new Date().toISOString().slice(0, 10),
  type: "LESSON",
  comment: "",
});

  const loadStudent = async () => {
    const data = await fetch(`/api/students/${id}`).then((r) => r.json());
    setStudent(data);

    setForm({
      grade: data.grade || "",
      fullName: data.fullName || "",
      phone: data.phone || "",
      parentName: data.parentName || "",
      parentPhone: data.parentPhone || "",
      parentEmail: data.parentEmail || "",
      startedAt: data.startedAt ? data.startedAt.slice(0, 10) : "",
      defaultRate: data.defaultRate || "",
      sourceName: data.sourceName || "",
      sourceLink: data.sourceLink || "",
      desiredResult: data.desiredResult || "",
      actualScore: data.actualScore || "",
      university: data.university || "",
      direction: data.direction || "",
      status: data.status || "ACTIVE",
    });
  };

  useEffect(() => {
    loadStudent();
  }, []);

  const saveStudent = async () => {
    await fetch(`/api/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    await loadStudent();
    alert("Карточка сохранена");
  };

  if (!student || !form) {
  return <main className="p-6">Загрузка...</main>;
  }

  const paid = student.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const charged = student.lessons
    .filter((l: any) => l.status === "COMPLETED")
    .reduce((sum: number, l: any) => sum + l.price, 0);

  const balance = paid - charged;

  const createHomework = async () => {
  if (!homeworkForm.title.trim()) return;

  await fetch("/api/homeworks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...homeworkForm,
      studentId: id,
    }),
  });

  setHomeworkForm({
    title: "",
    description: "",
    deadline: "",
  });

  await loadStudent();
};

const updateHomeworkStatus = async (homework: any, status: string) => {
  await fetch("/api/homeworks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: homework.id,
      title: homework.title,
      description: homework.description,
      deadline: homework.deadline,
      status,
    }),
  });

  await loadStudent();
};

const deleteHomework = async (homeworkId: string) => {
  if (!confirm("Удалить домашнее задание?")) return;

  await fetch("/api/homeworks", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: homeworkId }),
  });

  await loadStudent();
};

const tabs = [
  { id: "main", label: "Основное" },
  { id: "finance", label: "Финансы" },
  { id: "lessons", label: "Занятия" },
  { id: "homework", label: "ДЗ" },
  { id: "notes", label: "Заметки" },
] as const;

const createPayment = async () => {
  if (!paymentForm.amount) return;

  await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...paymentForm,
      studentId: id,
    }),
  });

  setPaymentForm({
    amount: "",
    paidAt: new Date().toISOString().slice(0, 10),
    type: "LESSON",
    comment: "",
  });

  await loadStudent();
};

const createNote = async () => {
  if (!noteText.trim()) return;

  await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: id,
      content: noteText,
    }),
  });

  setNoteText("");
  await loadStudent();
};

const updateNote = async (noteId: string) => {
  if (!editingNoteText.trim()) return;

  await fetch("/api/notes", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: noteId,
      content: editingNoteText,
    }),
  });

  setEditingNoteId(null);
  setEditingNoteText("");
  await loadStudent();
};

const deleteNote = async (noteId: string) => {
  await fetch("/api/notes", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: noteId }),
  });

  await loadStudent();
};



  return (
    <main className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="bg-white rounded-3xl p-3 m-5 shadow-sm border border-gray-100 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id
                  ? "px-4 py-2 rounded-2xl bg-black text-white text-sm transition"
                  : "px-4 py-2 rounded-2xl text-sm hover:bg-gray-100 transition"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">
            {form.fullName?.[0] || "?"}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{form.fullName || "Ученик"}</h1>
            <div className="text-gray-500 mt-1">
              {form.phone || "Телефон не указан"} · {form.status}
            </div>
          </div>
        </div>
      </div>
      
      {activeTab === "main" && (
        <>
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">Основные данные</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="ФИО" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                placeholder="Класс"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Родитель" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Телефон родителя" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Почта родителя" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />

              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" type="date" value={form.startedAt} onChange={(e) => setForm({ ...form, startedAt: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Ставка" value={form.defaultRate} onChange={(e) => setForm({ ...form, defaultRate: e.target.value })} />

              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Откуда пришёл" value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Ссылка на источник" value={form.sourceLink} onChange={(e) => setForm({ ...form, sourceLink: e.target.value })} />

              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Желаемый результат" value={form.desiredResult} onChange={(e) => setForm({ ...form, desiredResult: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Набранные баллы по факту" value={form.actualScore} onChange={(e) => setForm({ ...form, actualScore: e.target.value })} />

              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Вуз" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
              <input className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" placeholder="Направление" value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} />

              <select className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Активен</option>
                <option value="PAUSED">Пауза</option>
                <option value="FINISHED">Завершил</option>
              </select>
            </div>

            <button onClick={saveStudent} className="mt-4 bg-black text-white px-5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition">
              Сохранить
            </button>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Группы</h2>

          <div className="flex flex-wrap gap-2">
            {student.groupStudents.length === 0 && (
              <span className="text-gray-500">Ученик пока не состоит в группах</span>
            )}

            {student.groupStudents.map((gs: any) => (
              <span key={gs.group.id} className="border rounded-full px-3 py-1">
                {gs.group.name}
              </span>
            ))}
          </div>
          </section>
        </>
      )}
      
      {activeTab === "finance" && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Оплачено</div>
              <div className="text-xl font-bold">{paid} ₽</div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Списано за занятия</div>
              <div className="text-xl font-bold">{charged} ₽</div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Баланс</div>
              <div className={balance < 0 ? "text-xl font-bold text-red-600" : "text-xl font-bold text-green-600"}>
                {balance} ₽
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">Добавить оплату</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                placeholder="Сумма"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
              />

              <input
                type="date"
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                value={paymentForm.paidAt}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, paidAt: e.target.value })
                }
              />

              <select
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                value={paymentForm.type}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, type: e.target.value })
                }
              >
                <option value="LESSON">За занятие</option>
                <option value="ADVANCE">Аванс</option>
                <option value="MONTH">За месяц</option>
                <option value="PACKAGE">Абонемент</option>
              </select>

              <input
                className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                placeholder="Комментарий"
                value={paymentForm.comment}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, comment: e.target.value })
                }
              />
            </div>

            <button
              onClick={createPayment}
              className="mt-4 bg-black text-white px-5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition"
            >
              Добавить оплату
            </button>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">Списания за проведённые занятия</h2>

            <div className="space-y-2">
              {student.lessons.filter((lesson: any) => lesson.status === "COMPLETED").length === 0 && (
                <div className="text-gray-500">Проведённых занятий пока нет</div>
              )}

              {student.lessons
                .filter((lesson: any) => lesson.status === "COMPLETED")
                .map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="border border-gray-100 rounded-2xl p-4 flex justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(lesson.startsAt).toLocaleString("ru-RU")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lesson.durationMin} мин · {lesson.status}
                      </div>
                    </div>

                    <div className="font-semibold text-red-600">
                      -{lesson.price} ₽
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4">История оплат</h2>

            <div className="space-y-2">
              {student.payments.map((payment: any) => (
                <div key={payment.id} className="border rounded p-3 flex justify-between">
                  <div>
                    <div>{new Date(payment.paidAt).toLocaleDateString("ru-RU")}</div>
                    <div className="text-sm text-gray-500">{payment.type}</div>
                  </div>
                  <div className="font-semibold">{payment.amount} ₽</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "notes" && (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Заметки</h2>

          <div className="mb-4">
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
              placeholder="Добавить заметку..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />

            <button
              onClick={createNote}
              className="mt-2 bg-black text-white px-4 py-2 rounded-xl"
            >
              Добавить
            </button>
          </div>

          <div className="space-y-3">
            {student.notes.length === 0 && (
              <div className="text-gray-500">Заметок пока нет</div>
            )}

            {student.notes.map((note: any) => (
              <div
                key={note.id}
                className="border border-gray-100 rounded-2xl p-4"
              >
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-gray-500">
                    {new Date(note.createdAt).toLocaleString("ru-RU")}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingNoteText(note.content);
                      }}
                      className="text-gray-500 text-sm hover:text-black"
                    >
                      редактировать
                    </button>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 text-sm"
                    >
                      удалить
                    </button>
                  </div>
                </div>

                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateNote(note.id)}
                        className="bg-black text-white px-3 py-1.5 rounded-xl text-sm"
                      >
                        Сохранить
                      </button>

                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditingNoteText("");
                        }}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-sm"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{note.content}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {activeTab === "homework" && (
        <>
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Домашние задания</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
              placeholder="Название ДЗ"
              value={homeworkForm.title}
              onChange={(e) =>
                setHomeworkForm({ ...homeworkForm, title: e.target.value })
              }
            />

            <input
              className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
              placeholder="Описание / ссылка / комментарий"
              value={homeworkForm.description}
              onChange={(e) =>
                setHomeworkForm({ ...homeworkForm, description: e.target.value })
              }
            />

            <input
              type="date"
              className="border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
              value={homeworkForm.deadline}
              onChange={(e) =>
                setHomeworkForm({ ...homeworkForm, deadline: e.target.value })
              }
            />
          </div>

          <button
            onClick={createHomework}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            Выдать ДЗ
          </button>

          <div className="space-y-2">
            {student.homeworks.length === 0 && (
              <div className="text-gray-500">Домашних заданий пока нет</div>
            )}

            {student.homeworks.map((homework: any) => (
              <div key={homework.id} className="border rounded p-3">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="font-semibold">{homework.title}</div>

                    {homework.description && (
                      <div className="text-sm text-gray-500">
                        {homework.description}
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Дедлайн:{" "}
                      {homework.deadline
                        ? new Date(homework.deadline).toLocaleDateString("ru-RU")
                        : "не указан"}
                    </div>
                  </div>

                  <div className="text-right">
                    <select
                      className="border rounded p-2 mb-2"
                      value={homework.status}
                      onChange={(e) =>
                        updateHomeworkStatus(homework, e.target.value)
                      }
                    >
                      <option value="ASSIGNED">Выдано</option>
                      <option value="DONE">Выполнено</option>
                      <option value="CHECKED">Проверено</option>
                      <option value="OVERDUE">Просрочено</option>
                    </select>

                    <button
                      onClick={() => deleteHomework(homework.id)}
                      className="block text-red-600 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Домашние задания из групп</h2>

          <div className="space-y-2">
            {student.groupStudents.flatMap((gs: any) =>
              gs.group.homeworks.map((homework: any) => (
                <div key={homework.id} className="border rounded p-3">
                  <div className="font-semibold">{homework.title}</div>
                  <div className="text-sm text-gray-500">Группа: {gs.group.name}</div>

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
              ))
            )}
          </div>
        </section>
        </>
      )}

      {activeTab === "lessons" && (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">История занятий</h2>

          <div className="space-y-2">
            {student.lessons.map((lesson: any) => (
              <div key={lesson.id} className="border rounded p-3 flex justify-between">
                <div>
                  <div>{new Date(lesson.startsAt).toLocaleString("ru-RU")}</div>
                  <div className="text-sm text-gray-500">{lesson.status}</div>
                </div>
                <div className="font-semibold">{lesson.price} ₽</div>
              </div>
            ))}
          </div>
        </section>
      )}
      
    </main>
  );
}