import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urgency, formatDeadline } from "../lib/date";

// Category Specific Themes
const CATEGORY_THEME = {
  overdue: {
    text: "text-[#CF0003]",
    pillBg: "bg-[#FFE2E0]",
    border: "border-[#CF0003]",
    borderColorClass: "border-l-[#CF0003]",
    avatar: "bg-[#CF0003] text-white",
  },
  today: {
    text: "text-[#8EA824]",
    pillBg: "bg-[#F2FDC3]",
    border: "border-[#8EA824]",
    borderColorClass: "border-l-[#B0E01E]",
    avatar: "bg-[#8EA824] text-[#1E1E24]",
  },
  upcoming: {
    text: "text-[#008ACF]",
    pillBg: "bg-[#DDEFFE]",
    border: "border-[#008ACF]",
    borderColorClass: "border-l-[#008ACF]",
    avatar: "bg-[#008ACF] text-[#1E1E24]",
  },
  none: {
    text: "text-[#A06E32]",
    pillBg: "bg-[#FFF0DD]",
    border: "border-[#A06E32]",
    borderColorClass: "border-l-[#FFC684]",
    avatar: "bg-[#A06E32] text-white",
  },
  done: {
    text: "text-[#5B7FE6]",
    pillBg: "bg-[#E8ECFF]",
    border: "border-[#89A1FF]",
    borderColorClass: "border-l-[#89A1FF]",
    avatar: "bg-[#89A1FF] text-[#1E1E24]",
  },
};

// Helper: completed tasks always use the Completed section's colors
function getTaskCategory(task) {
  if (task.completed) return "done";
  if (task.category) return task.category;
  if (!task.deadline) return "none";
  const rawUrgency = urgency({ ...task, completed: false });
  return rawUrgency || "none";
}

// Normalize assignees from the various shapes stored in the DB
function getAssigneeList(task) {
  const raw = task.assignees || task.assignee || task.mentionedUser || [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

// Turn raw URLs in the description into short clickable links
function renderDescription(des) {
  if (!des) return null;
  const parts = des.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const label = part.replace(/^https?:\/\//, "");
      const short = label.length > 42 ? label.slice(0, 42) + "…" : label;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#9ecfff] underline underline-offset-2 break-all"
        >
          {short}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function CheckButton({ task, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(task.id)}
      aria-label={
        task.completed ? `Reopen task: ${task.task}` : `Complete task: ${task.task}`
      }
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
        task.completed
          ? "bg-[#89A1FF] border-[#89A1FF] text-white"
          : "border-gray-400 hover:border-gray-200 bg-transparent text-transparent"
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </button>
  );
}

function EditButton({ task, onEdit }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(task)}
      aria-label={`Edit task: ${task.task}`}
      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 4.58605L1 12.5861V16.5861H17M1 16.5861L5 16.586L13 8.58604M9 4.58605L11.8686 1.7174L11.8704 1.7157C12.2652 1.32082 12.463 1.12303 12.691 1.04894C12.8919 0.983686 13.1082 0.983686 13.3091 1.04894C13.5369 1.12297 13.7345 1.32054 14.1288 1.71486L15.8686 3.45466C16.2646 3.85067 16.4627 4.04878 16.5369 4.2771C16.6022 4.47795 16.6021 4.69429 16.5369 4.89513C16.4628 5.1233 16.265 5.3211 15.8695 5.71655L15.8686 5.7174L13 8.58604M9 4.58605L13 8.58604"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function DeleteButton({ task, onDelete }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(task.id)}
      aria-label={`Delete task: ${task.task}`}
      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-gray-400 hover:text-[#FC4445] hover:bg-white/10 transition-colors cursor-pointer"
    >
      <svg
        width="15"
        height="17"
        viewBox="0 0 18 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 8V15M7 8V15M3 4V15.8C3 16.9201 3 17.4798 3.21799 17.9076C3.40973 18.2839 3.71547 18.5905 4.0918 18.7822C4.5192 19 5.07899 19 6.19691 19H11.8031C12.921 19 13.48 19 13.9074 18.7822C14.2837 18.5905 14.5905 18.2839 14.7822 17.9076C15 17.4802 15 16.921 15 15.8031V4M3 4H5M3 4H1M5 4H13M5 4C5 3.06812 5 2.60241 5.15224 2.23486C5.35523 1.74481 5.74432 1.35523 6.23438 1.15224C6.60192 1 7.06812 1 8 1H10C10.9319 1 11.3978 1 11.7654 1.15224C12.2554 1.35523 12.6447 1.74481 12.8477 2.23486C12.9999 2.6024 13 3.06812 13 4M13 4H15M15 4H17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function AttachmentButton({ task, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View attachment for: ${task.task}`}
      className="text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer"
    >
      <svg
        width="14"
        height="16"
        viewBox="0 0 18 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 9.43198L7.89429 2.53769C9.94454 0.487437 13.2687 0.487437 15.319 2.53769C17.3692 4.58794 17.369 7.91224 15.3187 9.96249L7.36377 17.9174C5.99693 19.2843 3.78123 19.2841 2.4144 17.9173C1.04756 16.5504 1.04723 14.3346 2.41406 12.9677L10.369 5.01279C11.0524 4.32937 12.1611 4.32937 12.8445 5.01279C13.5279 5.6962 13.5274 6.80398 12.844 7.4874L5.94971 14.3817"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function AvatarStack({ members, small, accentTheme }) {
  if (!members.length) return null;
  const shown = members.slice(0, 2);
  const extra = members.length - shown.length;
  const size = small ? "w-6 h-6 text-[9px]" : "w-7 h-7 text-[10px]";
  return (
    <span className="relative inline-flex items-center shrink-0 group/av">
      {shown.map((m, i) => (
        <span
          key={i}
          className={`${size} rounded-full ${accentTheme.avatar} font-mono font-bold flex items-center justify-center border-2 border-[#1E1E23] ${
            i > 0 ? "-ml-2" : ""
          }`}
        >
          {initials(m)}
        </span>
      ))}
      {extra > 0 && (
        <span
          className={`${size} rounded-full bg-[#3a3a42] text-white font-mono font-bold flex items-center justify-center border-2 border-[#1E1E23] -ml-2`}
        >
          +{extra}
        </span>
      )}
      <span className="hidden group-hover/av:block absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#FDD739] text-xs font-sans rounded-xl px-3 py-2 shadow-2xl border border-gray-900 z-50 whitespace-nowrap pointer-events-none">
        <span className="font-sans font-semibold text-[11px] text-[#1E1E23] border-b border-gray-500 pb-1 mb-0.5 block">
          Assigned Members ({members.length}):
        </span>
        {members.map((m, idx) => (
          <span key={idx} className="flex items-center gap-1.5 text-[#1E1E23]">
            • {m}
          </span>
        ))}
      </span>
    </span>
  );
}

function DatePill({ task, accentTheme, small }) {
  return (
    <span
      className={`${
        small ? "px-2.5 py-0.5 text-[11px]" : "px-3.5 py-1 text-sm"
      } rounded-xl font-mono border shrink-0 ${accentTheme.pillBg} ${
        accentTheme.text
      } ${accentTheme.border}`}
    >
      {task.deadline ? formatDeadline(task.deadline) : "No Date"}
    </span>
  );
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (showImageModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showImageModal]);

  const categoryKey = getTaskCategory(task);
  const accentTheme = CATEGORY_THEME[categoryKey] || CATEGORY_THEME.none;
  const members = getAssigneeList(task);
  const hasImage = Boolean(task.image || task.img);
  const titleClass = task.completed
    ? "text-gray-400 line-through decoration-2"
    : "text-white";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative group shrink-0 hover:z-30"
      >
        <div
          className={`relative z-10 bg-[#1E1E23] text-white shadow-xl transition-all duration-200 w-full md:w-82 border-l-[6px] rounded-[20px] p-4 md:border-l-8 md:rounded-4xl md:pl-5 md:pr-4 md:py-5 ${accentTheme.borderColorClass} ${
            task.completed ? "opacity-60" : "opacity-100"
          }`}
        >
          {/* ============ DESKTOP : Option A (structured) ============ */}
          <div className="hidden md:flex flex-col w-full">
            <div className="flex items-center gap-3 mb-2">
              <CheckButton task={task} onToggle={onToggle} />
              <h3
                className={`text-xl font-bold font-afacad truncate flex-1 min-w-0 ${titleClass}`}
              >
                {task.task}
              </h3>
              {hasImage && (
                <AttachmentButton
                  task={task}
                  onOpen={() => setShowImageModal(true)}
                />
              )}
              <AvatarStack members={members} accentTheme={accentTheme} />
            </div>

            {task.des ? (
              <p className="text-lg font-afacad font-normal line-clamp-2 text-gray-300 mb-3">
                {renderDescription(task.des)}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <DatePill task={task} accentTheme={accentTheme} />
              <span className="flex-1" />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditButton task={task} onEdit={onEdit} />
                <DeleteButton task={task} onDelete={onDelete} />
              </div>
            </div>
          </div>

          {/* ============ MOBILE : Option B (compact) ============ */}
          <div className="flex md:hidden flex-col w-full">
            <div className="flex items-center gap-2.5">
              <CheckButton task={task} onToggle={onToggle} />
              <h3
                className={`text-lg font-bold font-afacad truncate flex-1 min-w-0 ${titleClass}`}
              >
                {task.task}
              </h3>
              {hasImage && (
                <AttachmentButton
                  task={task}
                  onOpen={() => setShowImageModal(true)}
                />
              )}
              <AvatarStack members={members} small accentTheme={accentTheme} />
              <DatePill task={task} accentTheme={accentTheme} small />
            </div>

            {task.des ? (
              <p className="text-[15px] font-afacad font-normal text-gray-300 line-clamp-1 break-all min-w-0 mt-1.5 ml-[30px]">
                {renderDescription(task.des)}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-1 mt-2 -mb-1">
              <EditButton task={task} onEdit={onEdit} />
              <DeleteButton task={task} onDelete={onDelete} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#222222] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
            >
              <img
                src={task.image || task.img}
                alt={task.task}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
