import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teacher Planner",
  description: "Планер репетитора",
};

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: "📊" },
  { href: "/analytics", label: "Аналитика", icon: "📈" },
  { href: "/calendar", label: "Календарь", icon: "📅" },
  { href: "/students", label: "Ученики", icon: "👨‍🎓" },
  { href: "/groups", label: "Группы", icon: "👥" },
  { href: "/finance", label: "Финансы", icon: "💰" },
  { href: "/lessons", label: "Занятия", icon: "🧾" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen flex bg-[#f7f7f8] text-gray-900">
          <aside className="w-72 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen">
            <div className="mb-8">
              <div className="text-xl font-bold">Teacher Planner</div>
              <div className="text-sm text-gray-500 mt-1">
                Рабочее пространство
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-gray-100 transition"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </body>
    </html>
  );
}