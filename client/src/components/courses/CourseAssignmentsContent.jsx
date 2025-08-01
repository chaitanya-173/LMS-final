import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardList,
  Search,
  FileCheck,
  ExternalLink,
  Upload,
} from "lucide-react";
import { useCourse } from "@/context/CourseContext";
import { fetchAssignmentStatus } from "@/api/assignmentApi";
import toast from "react-hot-toast";

/**
 * CourseAssignmentsContent
 * Shows all assignments for a course (one per lecture with assignment meta).
 * Hydrates student-specific state from:
 *   GET /api/student/assignments/:lectureId/status
 */
const CourseAssignmentsContent = ({ allLectures }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { currentCourseDetails } = useCourse() ?? {};

  const [search, setSearch] = useState("");

  /* ------------------------------------------------------------------
   * Build base list fast from lectures
   * ------------------------------------------------------------------ */
  const baseAssignments = useMemo(() => {
    return (allLectures || [])
      .filter((lec) => lec.assignment?.fileUrl)
      .map((lec) => ({
        lectureId: lec._id,
        lectureTitle: lec.title,
        title: lec.assignment.title || "Assignment",
        fileUrl: lec.assignment.fileUrl,
        dueDate: lec.assignment.dueDate || null,
        submitted: lec.assignment.submitted ?? false, // optimistic placeholder
        submissionId: lec.assignment.submissionId || null,
      }));
  }, [allLectures]);

  /*
   * statusByLecture: keyed by lectureId
   */
  const [statusByLecture, setStatusByLecture] = useState({});

  /* ------------------------------------------------------------------
   * Fetch status for each assignment
   * ------------------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      const entries = await Promise.all(
        baseAssignments.map(async (row) => {
          try {
            const res = await fetchAssignmentStatus(row.lectureId);
            if (res?.error) {
              return [row.lectureId, { loading: false, error: true }];
            }

            const submission = res.submission || null;
            const meta = res.assignment || {};

            return [
              row.lectureId,
              {
                loading: false,
                error: false,
                submitted: Boolean(res.submitted),
                submissionId: submission?._id || null,
                submissionFiles: submission?.files || [],
                isLate: submission?.isLate || false,
                status:
                  submission?.status ||
                  (res.submitted ? "submitted" : "not_submitted"),
                grade: submission?.grade ?? null,
                score: submission?.score ?? null,
                remarks: submission?.remarks ?? null,
                assignment: {
                  title: meta.title || row.title,
                  fileUrl: meta.fileUrl || row.fileUrl,
                  dueDate: meta.dueDate || row.dueDate,
                  allowResubmission: meta.allowResubmission ?? true,
                },
              },
            ];
          } catch (err) {
            console.error("Assignment status fetch error for", row.lectureId, err);
            return [row.lectureId, { loading: false, error: true }];
          }
        })
      );

      if (cancelled) return;
      const merged = {};
      for (const [lecId, val] of entries) merged[lecId] = val;
      setStatusByLecture(merged);
    }

    // initial loading state
    const initial = {};
    for (const row of baseAssignments) {
      initial[row.lectureId] = {
        loading: true,
        error: false,
        submitted: row.submitted,
        submissionId: row.submissionId,
        submissionFiles: [],
        isLate: false,
        status: "loading",
        grade: null,
        score: null,
        remarks: null,
        assignment: {
          title: row.title,
          fileUrl: row.fileUrl,
          dueDate: row.dueDate,
          allowResubmission: true,
        },
      };
    }
    setStatusByLecture(initial);

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [baseAssignments]);

  /* ------------------------------------------------------------------
   * Merge base + live status
   * ------------------------------------------------------------------ */
  const enrichedAssignments = useMemo(() => {
    return baseAssignments.map((row) => {
      const st = statusByLecture[row.lectureId];
      if (!st) return row;
      return {
        ...row,
        title: st.assignment?.title || row.title,
        fileUrl: st.assignment?.fileUrl || row.fileUrl,
        dueDate: st.assignment?.dueDate || row.dueDate,
        submitted: st.submitted,
        submissionId: st.submissionId,
        submissionFiles: st.submissionFiles || [],
        isLate: st.isLate,
        graded: st.status === "graded" || st.grade != null || st.score != null,
        grade: st.grade,
        score: st.score,
        status: st.status,
        loading: st.loading,
        error: st.error,
        allowResubmission: st.assignment?.allowResubmission ?? true,
      };
    });
  }, [baseAssignments, statusByLecture]);

  /* ------------------------------------------------------------------
   * Search filter
   * ------------------------------------------------------------------ */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enrichedAssignments;
    return enrichedAssignments.filter(
      (a) =>
        a.lectureTitle.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
    );
  }, [search, enrichedAssignments]);

  /* ------------------------------------------------------------------
   * Actions
   * ------------------------------------------------------------------ */

  // View original assignment instructions
  const viewAssignment = useCallback(
    (a) => {
      navigate(`/pdf-viewer/${a.lectureId}/assignment`, {
        state: {
          fileUrl: a.fileUrl,
          fileName: a.title,
          lectureTitle: a.lectureTitle,
          courseId,
        },
      });
    },
    [navigate, courseId]
  );

  // View one submitted file (ALWAYS allowed)
  const viewSubmittedFile = useCallback(
    (a, file) => {
      navigate(`/pdf-viewer/${a.lectureId}/assignment`, {
        state: {
          fileUrl: file.fileUrl,
          fileName: file.fileName || a.title,
          lectureTitle: a.lectureTitle,
          courseId,
          fromSubmission: true,
          submissionId: a.submissionId,
        },
      });
    },
    [navigate, courseId]
  );

  // Submit / Resubmit
  const submitAssignment = useCallback(
    (a) => {
      const now = Date.now();
      const dueMs = a.dueDate ? new Date(a.dueDate).getTime() : null;
      const pastDue = dueMs ? now > dueMs : false;

      if (a.graded) {
        toast.error("This assignment has been graded; you cannot resubmit.");
        return;
      }
      if (a.submitted && !a.allowResubmission) {
        toast.error("Resubmission is not allowed for this assignment.");
        return;
      }
      if (a.submitted && pastDue && a.allowResubmission) {
        toast.error("Deadline passed — resubmission not allowed.");
        return;
      }

      navigate(`/assignment/${a.lectureId}/submit`, {
        state: {
          assignmentTitle: a.title,
          lectureTitle: a.lectureTitle,
          courseId,
          dueDate: a.dueDate,
          submitted: a.submitted,
          submissionId: a.submissionId,
        },
      });
    },
    [navigate, courseId]
  );

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-orange-400" />
          <h1 className="text-2xl font-semibold">
            {currentCourseDetails?.title
              ? `${currentCourseDetails.title} • Assignments`
              : "Course Assignments"}
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-16 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-gray-500 text-sm">
            No assignments found.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const hasDue = Boolean(a.dueDate);
              const dueLabel = hasDue ? formatDueDate(a.dueDate) : null;
              const now = Date.now();
              const pastDue = hasDue ? now > new Date(a.dueDate).getTime() : false;

              const disableSubmit =
                a.loading ||
                a.graded ||
                (a.submitted && !a.allowResubmission) ||
                (pastDue && a.submitted) ||
                false;

              const badges = [];
              if (hasDue) {
                badges.push(
                  <span key="due" className="text-gray-500">
                    Due: {dueLabel}
                  </span>
                );
              }
              if (a.loading) {
                badges.push(
                  <span
                    key="loading"
                    className="inline-block px-2 py-[2px] rounded-md bg-[#2a2a2a] text-gray-400 border border-gray-600/40"
                  >
                    Loading...
                  </span>
                );
              } else if (a.error) {
                badges.push(
                  <span
                    key="error"
                    className="inline-block px-2 py-[2px] rounded-md bg-red-600/20 text-red-400 border border-red-500/40"
                  >
                    Failed
                  </span>
                );
              } else if (a.graded) {
                badges.push(
                  <span
                    key="graded"
                    className="inline-block px-2 py-[2px] rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/40"
                  >
                    Graded
                  </span>
                );
              } else if (a.submitted) {
                badges.push(
                  <span
                    key="submitted"
                    className="inline-block px-2 py-[2px] rounded-md bg-green-600/20 text-green-400 border border-green-500/40"
                  >
                    Submitted
                  </span>
                );
              }
              if (!a.loading && a.isLate && !a.graded) {
                badges.push(
                  <span
                    key="late"
                    className="inline-block px-2 py-[2px] rounded-md bg-yellow-600/20 text-yellow-400 border border-yellow-500/40"
                  >
                    Late
                  </span>
                );
              }

              return (
                <li
                  key={a.lectureId}
                  className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/10 transition"
                >
                  {/* Icon + Text */}
                  <div className="flex items-start gap-2 mb-3">
                    <FileCheck
                      size={20}
                      className="text-orange-400 mt-[2px] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {a.lectureTitle}
                      </p>

                      {/* Meta badges */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {badges}
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="mt-auto flex items-center gap-2">
                    {/* View Original Assignment */}
                    <button
                      type="button"
                      onClick={() => viewAssignment(a)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-[#2a2a2a] hover:bg-orange-500 hover:text-black transition"
                    >
                      View
                      <ExternalLink size={14} />
                    </button>

                    {/* Submit / Resubmit */}
                    <button
                      type="button"
                      disabled={disableSubmit}
                      onClick={() => submitAssignment(a)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition ${
                        disableSubmit
                          ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                          : "bg-[#2a2a2a] hover:bg-green-500 hover:text-black"
                      }`}
                    >
                      {a.submitted ? "Resubmit" : "Submit"}
                      <Upload size={14} />
                    </button>
                  </div>

                  {/* Submitted Files Section */}
                  {a.submitted && a.submissionFiles?.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400 border-t border-[#2a2a2a] pt-2">
                      <p className="mb-1 text-gray-500">Your Submission:</p>
                      <ul className="space-y-1">
                        {a.submissionFiles.map((f, idx) => (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() => viewSubmittedFile(a, f)}
                              className="text-orange-400 hover:underline"
                            >
                              {f.fileName || `File ${idx + 1}`}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseAssignmentsContent;

/* ----------------- Helpers ----------------- */
function formatDueDate(raw) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
