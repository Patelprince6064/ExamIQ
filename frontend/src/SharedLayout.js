import React from "react";
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
} from "react-icons/hi";
import { clearAuth, getUser } from "./api";
import logo from "./assets/logo.png";
import TimerWidget from "./TimerWidget";

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

export function SharedSidebar() {
  const navigate = useNavigate();
  const user = getUser();
  const path = window.location.pathname;

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="ExamIQ Logo" style={{ width: 38, height: 38, borderRadius: 11, objectFit: "cover" }} />
        <span className="logo-text">Exam<span>IQ</span></span>
      </div>
      <TimerWidget />
      {NAV_GROUPS.map((group) => (
        <div className="nav-section" key={group.label}>
          <p className="nav-label">{group.label}</p>
          <nav className="menu">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`menu-item ${path === item.to ? "active" : ""}`}
                >
                  <span className="nav-icon"><Icon size={16} /></span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name || "Student"}</p>
          <p className="user-role">Student</p>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <HiOutlineLogout />
        </button>
      </div>
    </div>
  );
}