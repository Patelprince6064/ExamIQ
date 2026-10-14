import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLogout } from "react-icons/hi";
import {
  HiOutlineHome,
  HiOutlineChatAlt2,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineMap,
  HiOutlineDocumentText,
  HiOutlineDocumentSearch,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { clearAuth, getUser } from "../../services/api";
import logo from "../../assets/logo.png";
import TimerWidget from "../timer/TimerWidget";
import "./SharedLayout.css";

const NAV_GROUPS = [
  {
    label: "Main Menu",
    items: [
      { to: "/dashboard", icon: HiOutlineHome, label: "Dashboard" },
      { to: "/practice",  icon: HiOutlineChatAlt2, label: "AI Practice" },
      { to: "/subjects",  icon: HiOutlineBookOpen, label: "Subjects" },
      { to: "/analytics", icon: HiOutlineChartBar, label: "Analytics" },
      { to: "/roadmap",   icon: HiOutlineMap, label: "Skill Roadmap" },
    ],
  },
  {
    label: "Learning Tools",
    items: [
      { to: "/pdf-upload", icon: HiOutlineDocumentText, label: "PDF Upload" },
      { to: "/paper-analyzer", icon: HiOutlineDocumentSearch, label: "Paper Analyzer" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/settings", icon: HiOutlineCog, label: "Settings" },
    ],
  },
];

export const closeMobileNav = () =>
  document.body.classList.remove("sidebar-open");

export function SharedSidebar() {
  const navigate = useNavigate();
  const user = getUser();
  const path = window.location.pathname;
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("examiq.navCollapsed") === "1"
  );

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    try {
      localStorage.setItem("examiq.navCollapsed", collapsed ? "1" : "0");
    } catch {
      /* storage unavailable — collapse still works for this session */
    }
  }, [collapsed]);

  // Escape closes the mobile drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeMobileNav();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    closeMobileNav();
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <div
        className="sidebar-overlay"
        onClick={closeMobileNav}
        aria-hidden="true"
      />
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="logo">
          <img src={logo} alt="ExamIQ Logo" />
          <span className="logo-text">
            Exam<span>IQ</span>
          </span>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <HiOutlineChevronRight size={14} />
            ) : (
              <HiOutlineChevronLeft size={14} />
            )}
          </button>
        </div>
        <TimerWidget />
        {NAV_GROUPS.map((group) => (
          <div className="nav-section" key={group.label}>
            <p className="nav-label">{group.label}</p>
            <nav className="menu" aria-label={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileNav}
                    className={`menu-item ${
                      path === item.to ? "active" : ""
                    }`}
                    aria-current={path === item.to ? "page" : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <span className="menu-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        <div className="sidebar-user">
          <div className="user-avatar" aria-hidden="true">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Student"}</p>
            <p className="user-role">Student</p>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <HiOutlineLogout />
          </button>
        </div>
      </aside>
    </>
  );
}
