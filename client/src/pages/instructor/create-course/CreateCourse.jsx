// src/pages/instructor/create-course/CreateCourse.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Info as InfoIcon, ListTree, Settings as SettingsIcon } from "lucide-react";
import axios from "@/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";

import BasicInfoTab from "@/components/instructor/create-course/tabs/BasicInfoTab";
import CurriculumTab from "@/components/instructor/create-course/tabs/CurriculumTab";
import SettingsTab from "@/components/instructor/create-course/tabs/SettingsTab";

/* ---------- config ---------- */
const API_BASE = "/api/instructor";

/* ---------- utils ---------- */
const slugify = (str = "") =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/* ---------- initial form ---------- */
const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  language: "English",
  level: "Beginner",
  thumbnail: {
    url: "",
    publicId: ""
  },
  pricing: "",
  discount: "",
  originalPrice: "",
  includes: [],
  tags: [],
  validity: "Lifetime",
  status: "draft",
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // route: /instructor/courses/:courseId/edit (optional)
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);

  // structure
  const [hasDirectLectures, setHasDirectLectures] = useState(true);
  const [lectures, setLectures] = useState([]); // [{id, title, video: {url, publicId}}]
  const [chapters, setChapters] = useState([]); // [{id, title, lectures:[...] }]

  // ui flags
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  /* ------------ scroll-to-top on tab change ------------ */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  /* ------------ load exists if editing ------------ */
  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await axios.get(`${API_BASE}/courses/${courseId}`);
      const c = res.data?.course || res.data;
      if (!c) {
        toast.error("Course not found.");
        navigate("/instructor/courses");
        return;
      }
      setForm((p) => ({
        ...p,
        title: c.title || "",
        slug: c.slug || "",
        shortDescription: c.shortDescription || "",
        description: c.description || "",
        category: c.category || "",
        language: c.language || "English",
        level: c.level || "Beginner",
        thumbnail: {
          url: c.thumbnail?.url || "",
          publicId: c.thumbnail?.publicId || ""
        },
        pricing: c.pricing ?? "",
        discount: c.discount ?? "",
        originalPrice: c.originalPrice ?? "",
        includes: Array.isArray(c.includes) ? c.includes : [],
        tags: Array.isArray(c.tags) ? c.tags : [],
        validity: c.validity || "Lifetime",
        status: c.status || "draft",
      }));
      setHasDirectLectures(Boolean(c.hasDirectLectures));

      if (c.hasDirectLectures) {
        const lr = await axios.get(`${API_BASE}/by-course/${c._id}`);
        const raw = lr.data?.lectures || lr.data || [];
        setLectures(
          raw.map((l) => ({
            id: l._id,
            title: l.title,
            video: l.video || null, // updated to video object
          }))
        );
      } else {
        const chRes = await axios.get(`${API_BASE}/chapters/course/${c._id}`);
        const rawChaps = chRes.data?.chapters || chRes.data || [];
        setChapters(
          rawChaps.map((ch) => ({
            id: ch._id,
            title: ch.title,
            lectures: (ch.lectures || []).map((l) => ({
              id: l._id,
              title: l.title,
              video: l.video || null, // updated to video object
            })),
          }))
        );
      }
    } catch (err) {
      console.error("loadCourse error", err);
      toast.error("Failed to load course.");
    }
  }, [courseId, navigate]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  /* ------------ thumbnail upload ------------ */
  const handleThumbnailSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/utils/upload", formData);
      const { url, publicId } = res.data;

      setForm((prev) => ({
        ...prev,
        thumbnail: { url, publicId }
      }));

      toast.success("Thumbnail uploaded");
    } catch (err) {
      console.error("Thumbnail upload failed", err);
      toast.error("Thumbnail upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* cleanup blob URL when component unmounts or thumbnail changes */
  useEffect(() => {
    return () => {
      if (form.thumbnail?.url?.startsWith?.("blob:")) {
        URL.revokeObjectURL(form.thumbnail.url);
      }
    };
  }, [form.thumbnail?.url]);

  /* ------------ slug generate ------------ */
  const handleGenerateSlug = () => {
    setForm((p) => ({ ...p, slug: slugify(p.title) }));
  };

  /* ------------ payload build ------------ */
  const buildPayload = () => {
    const payload = {
      ...form,
      pricing: Number(form.pricing) || 0,
      discount: Number(form.discount) || 0,
      originalPrice: Number(form.originalPrice) || 0,
      hasDirectLectures,
    };

    if (hasDirectLectures) {
      payload.lectures = lectures.map((l, i) => ({
        _id: l.id?.startsWith?.("temp-") ? undefined : l.id,
        order: i,
        title: l.title,
        video: l.video || null, // updated here
      }));
      payload.curriculum = [];
    } else {
      payload.curriculum = chapters.map((ch) => ch.id);
      payload.chapters = chapters.map((ch, ci) => ({
        _id: ch.id?.startsWith?.("temp-") ? undefined : ch.id,
        order: ci,
        title: ch.title,
        lectures: ch.lectures.map((l, li) => ({
          _id: l.id?.startsWith?.("temp-") ? undefined : l.id,
          order: li,
          title: l.title,
          video: l.video || null, // updated here
        })),
      }));
    }
    return payload;
  };

  /* ------------ save ------------ */
  const saveCourse = async ({ publish = false } = {}) => {
    if (!form.title.trim()) {
      toast.error("Title required.");
      setActiveTab("basic");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (publish) payload.status = "published";

      if (courseId) {
        await axios.put(`${API_BASE}/courses/${courseId}`, payload);
        toast.success(publish ? "Course published." : "Course updated.");
      } else {
        const res = await axios.post(`${API_BASE}/courses`, payload);
        const newId = res.data?.course?._id || res.data?._id;
        toast.success("Course created.");
        if (newId) {
          navigate(`/instructor/courses/${newId}/edit`);
          return; // stop further execution
        }
      }
    } catch (err) {
      console.error("saveCourse error", err);
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ------------ sticky draft visible? ------------ */
  const showDraftBar = activeTab !== "settings";

  /* ------------ calc draft btn label ------------ */
  const draftLabel = useMemo(
    () => (saving ? "Saving..." : courseId ? "Save Draft" : "Create Draft"),
    [saving, courseId]
  );

  /* ------------ tab config ------------ */
  const tabs = [
    { key: "basic", label: "Basic Info", icon: <InfoIcon size={16} /> },
    { key: "curriculum", label: "Curriculum", icon: <ListTree size={16} /> },
    { key: "settings", label: "Settings & Pricing", icon: <SettingsIcon size={16} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-white">
      {/* heading */}
      <div>
        <h1 className="text-2xl font-bold">
          {courseId ? "Edit Course:" : "Create Course:"}{" "}
          <span className="text-[#f35e33]">{form.title || "Untitled"}</span>
        </h1>
        {user?.userName && (
          <p className="text-sm text-gray-400 mt-1">Instructor: {user.userName}</p>
        )}
      </div>

      {/* tab bar */}
      <div className="w-full grid grid-cols-3 bg-[#1d1d1b] border border-[#2a2826] rounded-md overflow-hidden text-sm">
        {tabs.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`py-2 px-4 flex items-center justify-center gap-2 transition-colors font-medium tracking-wide
                ${
                  isActive
                    ? "bg-[#f35e33] text-white"
                    : "text-gray-300 hover:bg-[#2d2c29] hover:text-white"
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* active panel */}
      {activeTab === "basic" && (
        <BasicInfoTab
          form={form}
          setForm={setForm}
          onGenerateSlug={handleGenerateSlug}
          onThumbnailSelect={handleThumbnailSelect}
          uploading={uploading}
        />
      )}

      {activeTab === "curriculum" && (
        <CurriculumTab
          hasDirectLectures={hasDirectLectures}
          setHasDirectLectures={setHasDirectLectures}
          lectures={lectures}
          setLectures={setLectures}
          chapters={chapters}
          setChapters={setChapters}
        />
      )}

      {activeTab === "settings" && (
        <SettingsTab
          form={form}
          setForm={setForm}
          saving={saving}
          onPublish={() => saveCourse({ publish: true })}
        />
      )}

      {/* sticky draft bar */}
      {showDraftBar && (
        <div className="sticky bottom-0 py-4 bg-gradient-to-t from-[#121212] to-transparent flex justify-end">
          <button
            type="button"
            onClick={() => saveCourse()}
            disabled={saving}
            className="px-6 py-2 bg-[#32312e] hover:bg-[#3a3936] rounded-md font-medium text-sm disabled:opacity-50"
          >
            {draftLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
