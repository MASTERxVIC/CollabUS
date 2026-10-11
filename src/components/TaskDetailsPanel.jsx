import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  renderDescription,
  CATEGORY_THEME,
  getTaskCategory,
  initials,
} from "./TaskCard";
import { formatDeadline } from "../lib/date";

const SECTION_LABEL = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
  none: "No date",
  done: "✓ Completed",
};

function formatLongDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailsPanel({
  task,
  boardName,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}) {
  const [showImage, setShowImage] = useState(false);
  const categoryKey = task ? getTaskCategory(task) : "none";
  const theme = CATEGORY_THEME[categoryKey] || CATEGORY_THEME.none;
  const imageSrc = task?.image || task?.img || null;
  const members = task?.assignees || task?.assignee || task?.mentionedUser || [];
  const memberList = Array.isArray(members) ? members : [members];

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div
            key="details-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#1E1E24]/40 backdrop-blur-sm"
          />
          <motion.div
            key="details-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`Task details: ${task.task}`}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-[#1E1E24] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <span
                className={`font-mono text-[11px] font-bold tracking-[0.12em] uppercase rounded-full border px-3 py-1.5 ${theme.pillBg} ${theme.text} ${theme.border}`}
              >
                {SECTION_LABEL[categoryKey] || "Task"}
              </span>
              <button
                onClick={onClose}
                aria-label="Close details"
                className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5">
              <h2 className="font-display font-semibold text-xl text-[#FDFBF7] leading-snug mb-4">
                {task.task}
              </h2>

              {task.des?.trim() ? (
                <div className="mb-6">
                  <p className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">
                    Description
                  </p>
                  <p className="text-[15px] text-gray-200 leading-relaxed break-words">
                    {renderDescription(task.des)}
                  </p>
                </div>
              ) : null}

              <p className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">
                Details
              </p>
              <div className="flex flex-col gap-2 mb-6 text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Due date</span>
                  <span className="text-[#FDFBF7]">
                    {task.deadline ? formatDeadline(task.deadline) : "—"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Status</span>
                  <span className="text-[#FDFBF7]">
                    {task.completed
                      ? `Completed${task.completed_at ? ` · ${formatLongDate(task.completed_at)}` : ""}`
                      : "Open"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-24 shrink-0">Created</span>
                  <span className="text-[#FDFBF7]">
                    {formatLongDate(task.created_at)}
                  </span>
                </div>
                {boardName ? (
                  <div className="flex gap-3">
                    <span className="text-gray-500 w-24 shrink-0">Board</span>
                    <span className="text-[#FDFBF7] truncate">{boardName}</span>
                  </div>
                ) : null}
              </div>

              {memberList.length > 0 ? (
                <div className="mb-6">
                  <p className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">
                    Assignees ({memberList.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {memberList.map((m, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1 pr-3 py-1 text-sm text-[#FDFBF7]"
                      >
                        <span
                          className={`w-6 h-6 rounded-full ${theme.avatar} font-mono text-[9px] font-bold flex items-center justify-center shrink-0`}
                        >
                          {initials(m)}
                        </span>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {imageSrc ? (
                <div className="mb-6">
                  <p className="text-[11px] font-mono font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">
                    Attachment
                  </p>
                  <button
                    onClick={() => setShowImage(true)}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2.5 pr-4 w-full text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <img
                      src={imageSrc}
                      alt="Task attachment"
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[#FDFBF7] truncate">
                        Attachment
                      </span>
                      <span className="block text-xs text-gray-500">
                        Tap to preview
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 px-6 py-4 border-t border-white/10 flex gap-2.5">
              <button
                onClick={() => onToggle(task.id)}
                className="flex-1 bg-[#FDD739] hover:bg-[#fdd739]/90 text-[#1E1E24] font-mono text-[13px] font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
              >
                {task.completed ? "↩ Reopen" : "✓ Complete"}
              </button>
              <button
                onClick={() => onEdit(task)}
                aria-label="Edit task"
                className="w-11 h-11 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 4.58605L1 12.5861V16.5861H17M1 16.5861L5 16.586L13 8.58604M9 4.58605L11.8686 1.7174C12.2652 1.32082 12.463 1.12303 12.691 1.04894C12.8919 0.983686 13.1082 0.983686 13.3091 1.04894C13.5369 1.12297 13.7345 1.32054 14.1288 1.71486L15.8686 3.45466C16.2646 3.85067 16.4627 4.04878 16.5369 4.2771C16.6022 4.47795 16.6021 4.69429 16.5369 4.89513C16.4628 5.1233 16.265 5.3211 15.8695 5.71655L13 8.58604M9 4.58605L13 8.58604"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
                className="w-11 h-11 rounded-xl border border-[#CF0003]/50 text-[#ff6b6b] hover:bg-[#CF0003]/15 inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m3 0l-.8 12.2a1 1 0 01-1 .8H7.8a1 1 0 01-1-.8L6 7m4 4v6m4-6v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Attachment lightbox */}
          <AnimatePresence>
            {showImage && imageSrc ? (
              <motion.div
                key="details-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowImage(false)}
                className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-6 cursor-pointer"
              >
                <img
                  src={imageSrc}
                  alt="Task attachment preview"
                  className="max-w-full max-h-full rounded-2xl shadow-2xl"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
