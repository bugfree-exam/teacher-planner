"use client";



import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";

type Student = {
  id: string;
  fullName: string;
  defaultRate: number | null;
};

type Topic = {
  id: string;
  title: string;
  subject: string | null;
  grade: number | null;
};

type Group = {
  id: string;
  name: string;
  defaultRate: number | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editLesson, setEditLesson] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    status: string;
    durationMin: number;
    price: number;
  } | null>(null);

  const handleEventMouseEnter = (info: any) => {
    setTooltip({
      visible: true,
      x: info.jsEvent.clientX,
      y: info.jsEvent.clientY,
      title: info.event.title,
      status: info.event.extendedProps.status,
      durationMin: info.event.extendedProps.durationMin,
      price: info.event.extendedProps.price,
    });
  };

  const handleEventMouseLeave = () => {
    setTooltip(null);
  };

  const [form, setForm] = useState({
    targetType: "student",
    studentId: "",
    groupId: "",
    topicId: "",
    startsAt: "",
    durationMin: "60",
    price: "",
    status: "PLANNED",
    note: "",
    repeatWeeks: "0",
  });

  const loadData = async () => {
    const lessons = await fetch("/api/lessons").then((r) => r.json());
    const studentsData = await fetch("/api/students/active").then((r) => r.json());
    const groupsData = await fetch("/api/groups").then((r) => r.json());
    const topicsData = await fetch("/api/topics").then((r) => r.json());

    setStudents(studentsData);
    setGroups(groupsData);
    setTopics(topicsData);

    setEvents(
      lessons.map((lesson: any) => {
        let color = "#e5e7eb"; // нейтральный

        if (lesson.status === "COMPLETED") color = "#dcfce7"; // мягкий зелёный
        if (lesson.status === "CANCELLED") color = "#fee2e2"; // мягкий красный
        if (lesson.status === "PLANNED") color = "#f3f4f6"; // серый

        const grade = lesson.student?.grade;

        if (grade === 11) color = "#dcfce7";
        else if (grade === 10) color = "#dbeafe";
        else if (grade && grade < 10) color = "#ede9fe";

        if (lesson.groupId) color = "#f3f4f6";

        if (lesson.status === "COMPLETED") color = "#bbf7d0";
        if (lesson.status === "CANCELLED") color = "#fee2e2";

        return {
          id: lesson.id,
          title: lesson.student?.fullName || lesson.group?.name || "Занятие",
          start: lesson.startsAt,
          end: new Date(
            new Date(lesson.startsAt).getTime() + lesson.durationMin * 60000
          ),
          backgroundColor: color,
          textColor: "#111827",
          borderColor: color,
          extendedProps: {
            status: lesson.status,
            durationMin: lesson.durationMin,
            price: lesson.price,
            studentId: lesson.studentId,
            groupId: lesson.groupId,
            grade: lesson.student?.grade,
          },
        };
      })
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelect = (info: any) => {
    setForm((prev) => ({
      ...prev,
      startsAt: info.startStr.slice(0, 16),
      studentId: prev.targetType === "student" ? prev.studentId : "",
      groupId: prev.targetType === "group" ? prev.groupId : "",
      price: prev.price,
      durationMin: prev.durationMin || "60",
      repeatWeeks: prev.repeatWeeks || "0",
    }));

    setIsOpen(true);
};

  const createLesson = async () => {
    if (!form.startsAt || !form.price) return;

    if (form.targetType === "student" && !form.studentId) return;
    if (form.targetType === "group" && !form.groupId) return;

    const repeatCount = Number(form.repeatWeeks);

    const baseDate = new Date(form.startsAt);

    await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType: form.targetType,
        studentId: form.targetType === "student" ? form.studentId : null,
        groupId: form.targetType === "group" ? form.groupId : null,
        topicId: form.topicId || null,
        startsAt: form.startsAt,
        durationMin: Number(form.durationMin),
        price: Number(form.price),
        status: form.status || "PLANNED",
        note: form.note || null,
        repeatWeeks: Number(form.repeatWeeks || 0),
      }),
    });

    setIsOpen(false);
    await loadData();
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);

    setForm({
      ...form,
      studentId,
      price: student?.defaultRate ? String(student.defaultRate) : form.price,
    });
  };

  const handleEventDrop = async (info: any) => {
    const lesson = events.find((e) => e.id === info.event.id);
    if (!lesson) return;

    await fetch(`/api/lessons/${editLesson.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: form.studentId || null,
        groupId: form.groupId || null,
        topicId: form.topicId || null,
        startsAt: form.startsAt,
        durationMin: Number(form.durationMin),
        price: Number(form.price),
        status: form.status,
        note: form.note || null,
      }),
    });

    await loadData();
  };

  const handleEventClick = (info: any) => {
    const lesson = events.find((e) => e.id === info.event.id);
    if (!lesson) return;

    setEditLesson({
      id: lesson.id,
      startsAt: info.event.startStr.slice(0, 16),
      durationMin: lesson.extendedProps.durationMin,
      price: lesson.extendedProps.price,
      studentId: lesson.extendedProps.studentId,
      groupId: lesson.extendedProps.groupId,
      targetType: lesson.extendedProps.groupId ? "group" : "student",
      status: lesson.extendedProps.status,
    });
  };

  const updateLesson = async () => {
    await fetch("/api/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editLesson,
        studentId: editLesson.targetType === "student" ? editLesson.studentId : null,
        groupId: editLesson.targetType === "group" ? editLesson.groupId : null,
      }),
    });

    setEditLesson(null);
    await loadData();
  };

  const deleteLesson = async () => {
    await fetch("/api/lessons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editLesson.id }),
    });

    setEditLesson(null);
    await loadData();
  };

  const renderEventContent = (eventInfo: any) => {

    const start = eventInfo.event.start;
    const end = eventInfo.event.end;

    const formatTime = (date: Date) =>
      date?.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const timeRange = start && end ? `${formatTime(start)} - ${formatTime(end)}` : "";

    const { event } = eventInfo;

    const status = event.extendedProps.status;

    let statusLabel = "";
    let statusColor = "text-gray-500";

    if (status === "COMPLETED") {
      statusLabel = "Проведено";
      statusColor = "text-green-600";
    }

    if (status === "CANCELLED") {
      statusLabel = "Отмена";
      statusColor = "text-red-500";
    }

    if (status === "PLANNED") {
      statusLabel = "Запланировано";
      statusColor = "text-gray-400";
    }

    return (
      <div className="h-full min-h-full flex flex-col justify-between px-2 py-1 rounded-xl bg-white shadow-sm border border-gray-100 text-xs overflow-hidden">
        
        {/* Имя */}
        <div className="font-medium text-gray-900 truncate">
          {eventInfo.event.title}
        </div>

        {/* ВРЕМЯ — ВОТ ЭТО МЫ ДОБАВЛЯЕМ */}
        <div className="text-[11px] text-blue-600 font-medium">
          {timeRange}
        </div>

        {/* Остальная инфа */}
        <div className="text-[11px] text-gray-500">
          {eventInfo.event.extendedProps.grade
            ? `${eventInfo.event.extendedProps.grade} класс · `
            : ""}
          {eventInfo.event.extendedProps.durationMin} мин · {eventInfo.event.extendedProps.price} ₽
        </div>

        {/* Статус */}
        <div className={`text-[10px] ${statusColor}`}>
          {statusLabel}
        </div>
      </div>
    );
  };

const handleEventResize = async (info: any) => {
  const lesson = events.find((e) => e.id === info.event.id);
  if (!lesson || !info.event.start || !info.event.end) return;

  const durationMin = Math.round(
    (info.event.end.getTime() - info.event.start.getTime()) / 60000
  );

  await fetch("/api/lessons", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: info.event.id,
      startsAt: info.event.startStr,
      durationMin,
      price: lesson.extendedProps.price,
      studentId: lesson.extendedProps.studentId || null,
      groupId: lesson.extendedProps.groupId || null,
      status: lesson.extendedProps.status,
    }),
  });

  await loadData();
};

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Календарь</h1>
        <p className="text-gray-500 mt-1">
          Расписание индивидуальных и групповых занятий
        </p>
      </div>

      <select
        className="border p-2 w-full rounded"
        value={form.targetType}
        onChange={(e) =>
          setForm({
            ...form,
            targetType: e.target.value,
            studentId: "",
            groupId: "",
            price: "",
          })
        }
      >
        <option value="student">Индивидуальное занятие</option>
        <option value="group">Групповое занятие</option>
      </select>

      <select
        className="border p-2 w-full rounded"
        value={form.repeatWeeks}
        onChange={(e) =>
          setForm({ ...form, repeatWeeks: e.target.value })
        }
      >
        <option value="0">Без повторения</option>
        <option value="4">На 4 недели</option>
        <option value="8">На 8 недель</option>
        <option value="12">На 12 недель</option>
      </select>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
      <FullCalendar
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        editable={true}
        eventResizableFromStart={true}
        eventResize={handleEventResize}
        eventContent={renderEventContent}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={ruLocale}
        nowIndicator={true}
        initialView="timeGridWeek"
        firstDay={1}
        selectable={true}
        select={handleSelect}
        events={events}
        height="auto"
        allDaySlot={false}

        slotMinTime="08:00:00"
        slotMaxTime="23:00:00"
        slotDuration="00:15:00"
        snapDuration="00:15:00"
        slotLabelInterval="01:00:00"
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "today timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Сегодня",
          week: "Неделя",
          day: "День",
        }}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-xl font-bold">Создать занятие</h2>

            {form.targetType === "student" && (
              <select
                className="border p-2 w-full rounded"
                value={form.studentId}
                onChange={(e) => handleStudentChange(e.target.value)}
              >
                <option value="">Выбери ученика</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            )}

            {form.targetType === "group" && (
              <select
                className="border p-2 w-full rounded"
                value={form.groupId}
                onChange={(e) => {
                  const groupId = e.target.value;
                  const group = groups.find((g) => g.id === groupId);

                  setForm({
                    ...form,
                    groupId,
                    price: group?.defaultRate ? String(group.defaultRate) : form.price,
                  });
                }}
              >
                <option value="">Выбери группу</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}

            <label className="block text-sm font-medium text-gray-700">
              Тема занятия
            </label>

            <select
              value={form.topicId}
              onChange={(e) =>
                setForm({
                  ...form,
                  topicId: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Без темы</option>

              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.grade ? `${topic.grade} класс · ` : ""}
                  {topic.subject ? `${topic.subject} · ` : ""}
                  {topic.title}
                </option>
              ))}
            </select>

            {/* <label className="block text-sm font-medium text-gray-700">
              Статус
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="PLANNED">Запланировано</option>
              <option value="COMPLETED">Проведено</option>
              <option value="CANCELLED">Отменено</option>
              <option value="MOVED">Перенесено</option>
            </select> */}

            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />

            <select
              className="border p-2 w-full rounded"
              value={form.durationMin}
              onChange={(e) =>
                setForm({ ...form, durationMin: e.target.value })
              }
            >
              <option value="60">60 минут</option>
              <option value="90">90 минут</option>
              <option value="120">120 минут</option>
            </select>

            <input
              className="border p-2 w-full rounded"
              placeholder="Цена"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Отмена
              </button>

              <button
                onClick={createLesson}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {editLesson && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-xl font-bold">Редактировать занятие</h2>

            <select
              className="border p-2 w-full rounded"
              value={editLesson.studentId || ""}
              onChange={(e) =>
                setEditLesson({ ...editLesson, studentId: e.target.value })
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
              className="border p-2 w-full rounded"
              value={editLesson.startsAt}
              onChange={(e) =>
                setEditLesson({ ...editLesson, startsAt: e.target.value })
              }
            />

            <select
              className="border p-2 w-full rounded"
              value={editLesson.durationMin}
              onChange={(e) =>
                setEditLesson({
                  ...editLesson,
                  durationMin: Number(e.target.value),
                })
              }
            >
              <option value="60">60 минут</option>
              <option value="90">90 минут</option>
              <option value="120">120 минут</option>
            </select>

            <input
              className="border p-2 w-full rounded"
              value={editLesson.price}
              onChange={(e) =>
                setEditLesson({ ...editLesson, price: Number(e.target.value) })
              }
            />

            <select
              className="border p-2 w-full rounded"
              value={editLesson.status}
              onChange={(e) =>
                setEditLesson({ ...editLesson, status: e.target.value })
              }
            >
              <option value="PLANNED">Запланировано</option>
              <option value="COMPLETED">Проведено</option>
              <option value="CANCELLED">Отменено</option>
              <option value="MOVED">Перенесено</option>
            </select>

            <div className="flex justify-between">
              <button
                onClick={deleteLesson}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Удалить
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditLesson(null)}
                  className="border px-4 py-2 rounded"
                >
                  Отмена
                </button>

                <button
                  onClick={updateLesson}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tooltip?.visible && (
        <div
          className="fixed z-[100] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 text-sm pointer-events-none w-64"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          <div className="font-semibold text-gray-900 mb-1">{tooltip.title}</div>

          <div className="text-gray-500">
            Статус:{" "}
            {tooltip.status === "PLANNED"
              ? "Запланировано"
              : tooltip.status === "COMPLETED"
              ? "Проведено"
              : tooltip.status === "CANCELLED"
              ? "Отменено"
              : "Перенесено"}
          </div>

          <div className="text-gray-500">Длительность: {tooltip.durationMin} мин</div>
          <div className="text-gray-500">Стоимость: {tooltip.price} ₽</div>
        </div>
      )}
    </main>
  );
}