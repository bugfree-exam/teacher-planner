"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  fullName: string;
};

type Payment = {
  id: string;
  amount: number;
  paidAt: string;
  type: string;
  comment: string | null;
  student: Student;
};

type Balance = {
  studentId: string;
  fullName: string;
  paid: number;
  charged: number;
  balance: number;
};

export default function FinancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);

  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    paidAt: new Date().toISOString().slice(0, 10),
    type: "LESSON",
    comment: "",
  });

  const loadData = async () => {
    const studentsData = await fetch("/api/students/active").then((r) => r.json());
    const paymentsData = await fetch("/api/payments").then((r) => r.json());
    const balancesData = await fetch("/api/balances").then((r) => r.json());

    setStudents(studentsData);
    setPayments(paymentsData);
    setBalances(balancesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createPayment = async () => {
    if (!form.studentId || !form.amount) return;

    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({
      studentId: "",
      amount: "",
      paidAt: new Date().toISOString().slice(0, 10),
      type: "LESSON",
      comment: "",
    });

    await loadData();
  };

  const deletePayment = async (id: string) => {
    if (!confirm("Удалить оплату?")) return;

    await fetch("/api/payments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await loadData();
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Финансы</h1>

      <section className="border rounded-xl p-4 mb-8">
        <h2 className="font-semibold mb-4">Добавить оплату</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="border rounded p-2"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          >
            <option value="">Ученик</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>

          <input
            className="border rounded p-2"
            placeholder="Сумма"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="date"
            className="border rounded p-2"
            value={form.paidAt}
            onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
          />

          <select
            className="border rounded p-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="LESSON">За занятие</option>
            <option value="ADVANCE">Аванс</option>
            <option value="MONTH">За месяц</option>
            <option value="PACKAGE">Абонемент</option>
          </select>

          <input
            className="border rounded p-2"
            placeholder="Комментарий"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>

        <button
          onClick={createPayment}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Добавить оплату
        </button>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-4">Баланс учеников</h2>

        <div className="space-y-2">
          {balances.map((b) => (
            <div
              key={b.studentId}
              className="border rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-semibold">{b.fullName}</div>
                <div className="text-sm text-gray-500">
                  Оплачено: {b.paid} ₽ · Занятий проведено: {b.charged} ₽
                </div>
              </div>

              <div
                className={
                  b.balance < 0
                    ? "text-red-600 font-bold"
                    : "text-green-600 font-bold"
                }
              >
                {b.balance} ₽
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-4">История оплат</h2>

        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-semibold">{p.student.fullName}</div>
                <div className="text-sm text-gray-500">
                  {new Date(p.paidAt).toLocaleDateString()} · {p.type}
                  {p.comment ? ` · ${p.comment}` : ""}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="font-bold">{p.amount} ₽</div>
                <button
                  onClick={() => deletePayment(p.id)}
                  className="text-red-600"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}