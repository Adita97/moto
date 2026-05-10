import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Video, Bike, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const sidebarLinks = [
    {
      to: "/admin",
      icon: LayoutDashboard,
      label: t("admin.dashboardTitle"),
      end: true,
    },
    { to: "/admin/videos", icon: Video, label: t("admin.videosTitle") },
    { to: "/admin/bikes", icon: Bike, label: t("admin.bikesTitle") },
  ];

  const linkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-3 px-4 py-3 font-sub text-sm tracking-wider uppercase transition-colors",
      isActive
        ? "text-accent bg-accent/10 border-r-2 border-accent"
        : "text-muted hover:text-text hover:bg-surface2",
    );

  return (
    <div className="min-h-screen bg-bg pt-16">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:fixed md:block md:left-0 md:top-16 md:bottom-0 md:w-60 bg-surface border-r border-border">
        <nav className="py-4 flex flex-col h-full">
          <div className="flex-1">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                end={link.end}
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 font-sub text-sm tracking-wider uppercase text-muted hover:text-danger transition-colors border-t border-border"
          >
            <LogOut size={18} />
            {t("nav.logout")}
          </button>
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden flex border-b border-border bg-surface">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                "flex-1 flex items-center justify-center gap-2 py-3 font-sub text-xs tracking-wider uppercase",
                isActive
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted",
              )
            }
          >
            <link.icon size={16} />
            {link.label}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="px-4 py-3 font-sub text-xs tracking-wider uppercase text-muted hover:text-danger"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Content */}
      <main className="md:ml-60 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
