"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/newsletter", label: "Newsletter Studio", icon: "📰" },
  { href: "/tasks", label: "Tasks", icon: "☑︎" },
  { href: "/video-ideas", label: "Video Ideas", icon: "🎬" },
  { href: "/video-research", label: "Video Research", icon: "🔍" },
  { href: "/sponsorships", label: "Sponsorship Finder", icon: "🤝" },
  { href: "/automations", label: "Automations", icon: "⚙︎", badge: "Soon" }
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-icon">⌘</span> Personal OS
      </Link>
      <div className="section-label">Tools</div>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}
        >
          <span>{item.icon}</span> {item.label}
          {item.badge && <span className="badge">{item.badge}</span>}
        </Link>
      ))}
      <div className="sidebar-footer">
        <div className="avatar">N</div>
        <div>Mission control · v0.1</div>
      </div>
    </aside>
  );
}
