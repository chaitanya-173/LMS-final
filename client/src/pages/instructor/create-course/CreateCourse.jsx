// src/pages/instructor/create-course/CreateCourse.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Info as InfoIcon, ListTree, Settings as SettingsIcon, X } from "lucide-react";
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
  const { courseId } = useParams();
  const { user, token } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [currentCourseId, setCurrentCourseId] = useState(courseId || null);

  // structure
  const [hasDirectLectures, setHasDirectLectures] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [chapters, setChapters] = useState([]);

  // ui flags
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // draft management
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [lastSavedData, setLastSavedData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // ✅ NEW: Track if data is loaded

  /* ------------ ✅ FIXED: Load draft on mount with better logic ------------ */
  useEffect(() => {
    const loadDraft = () => {
      try {
        // ✅ Try both draft keys - new course and existing course edits
        const newCourseDraft = localStorage.getItem('course-draft');
        const editCourseDraft = currentCourseId ? localStorage.getItem(`course-edit-${currentCourseId}`) : null;
        
        const savedData = editCourseDraft || newCourseDraft;
        
        if (savedData && !isDataLoaded) {
          const parsed = JSON.parse(savedData);
          
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (parsed.timestamp && Date.now() - parsed.timestamp < sevenDays) {
            console.log('📋 Loading draft data:', parsed);
            
            setForm(parsed.form || initialForm);
            setLectures(parsed.lectures || []);
            setChapters(parsed.chapters || []);
            setHasDirectLectures(parsed.hasDirectLectures ?? true);
            setActiveTab(parsed.activeTab || "basic");
            
            // ✅ Set loaded state to prevent re-loading
            setIsDataLoaded(true);
            setLastSavedData(parsed);
            setIsDraftSaved(true);
            setShowDraftNotification(true);
            
            setTimeout(() => setShowDraftNotification(false), 5000);
            console.log('✅ Draft loaded successfully');
            return;
          }
        }
        
        // ✅ Mark as loaded even if no draft found
        setIsDataLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load draft:', error);
        localStorage.removeItem('course-draft');
        if (currentCourseId) {
          localStorage.removeItem(`course-edit-${currentCourseId}`);
        }
        setIsDataLoaded(true);
      }
    };

    loadDraft();
  }, [currentCourseId, isDataLoaded]);

  /* ------------ ✅ FIXED: Enhanced Auto-save with proper triggering ------------ */
  useEffect(() => {
    // ✅ Only auto-save if data is loaded (prevents initial auto-save)
    if (!isDataLoaded) return;
    
    const hasContent = form.title.trim() !== '' || 
                      form.description.trim() !== '' || 
                      lectures.length > 0 || 
                      chapters.length > 0;

    if (hasContent) {
      const currentData = {
        form,
        lectures,
        chapters,
        hasDirectLectures,
        activeTab,
        courseId: currentCourseId,
        timestamp: Date.now()
      };

      // ✅ Check if data has actually changed to prevent unnecessary saves
      const hasChanges = !lastSavedData || 
                        JSON.stringify(currentData) !== JSON.stringify(lastSavedData);

      if (hasChanges) {
        const timeoutId = setTimeout(() => {
          const draftKey = currentCourseId ? `course-edit-${currentCourseId}` : 'course-draft';
          localStorage.setItem(draftKey, JSON.stringify(currentData));
          setLastSavedData(currentData);
          setIsDraftSaved(true);
          console.log('💾 Auto-saved successfully:', { 
            courseId: currentCourseId,
            hasLectures: lectures.length,
            hasChapters: chapters.length,
            activeTab 
          });
        }, 1000); // ✅ Reduced delay for better UX

        return () => clearTimeout(timeoutId);
      }
    }
  }, [form, lectures, chapters, hasDirectLectures, activeTab, currentCourseId, lastSavedData, isDataLoaded]);

  /* ------------ ✅ ENHANCED: Tab change handler with state preservation ------------ */
  const handleTabChange = useCallback((newTab) => {
    console.log('🔄 Tab changing from', activeTab, 'to', newTab);
    
    // ✅ Force save current state before switching
    if (isDataLoaded) {
      const currentData = {
        form,
        lectures,
        chapters,
        hasDirectLectures,
        activeTab: newTab, // ✅ Save the target tab
        courseId: currentCourseId,
        timestamp: Date.now()
      };
      
      const draftKey = currentCourseId ? `course-edit-${currentCourseId}` : 'course-draft';
      localStorage.setItem(draftKey, JSON.stringify(currentData));
      setLastSavedData(currentData);
      console.log('💾 State saved before tab change');
    }
    
    setActiveTab(newTab);
  }, [form, lectures, chapters, hasDirectLectures, currentCourseId, isDataLoaded, activeTab]);

  /* ------------ Browser navigation protection ------------ */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasUnsavedContent = form.title.trim() !== '' || 
                               lectures.length > 0 || 
                               chapters.length > 0;
      
      if (hasUnsavedContent) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, lectures, chapters]);

  /* ------------ scroll-to-top on tab change ------------ */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  /* ------------ load existing course if editing ------------ */
  const loadCourse = useCallback(async () => {
    if (!currentCourseId || isDataLoaded) return;
    
    try {
      if (!token) {
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      console.log('🔍 Loading existing course:', currentCourseId);
      const res = await axios.get(`${API_BASE}/courses/${currentCourseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const c = res.data?.course || res.data;
      if (!c) {
        toast.error("Course not found.");
        navigate("/instructor/courses");
        return;
      }
      
      console.log('📚 Existing course loaded:', c);
      
      const loadedForm = {
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
      };

      setForm(loadedForm);
      setHasDirectLectures(Boolean(c.hasDirectLectures));

      // ✅ Set initial saved state to prevent unnecessary auto-saves
      const initialData = {
        form: loadedForm,
        lectures: [],
        chapters: [],
        hasDirectLectures: Boolean(c.hasDirectLectures),
        activeTab,
        courseId: currentCourseId,
        timestamp: Date.now()
      };

      if (c.hasDirectLectures) {
        try {
          const lr = await axios.get(`${API_BASE}/lectures/by-course/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const raw = lr.data?.lectures || lr.data || [];
          
          const loadedLectures = raw.map((l) => ({
            id: l._id,
            title: l.title || "",
            thumbnail: l.thumbnail || null,
            video: l.video || null,
            videoFile: null,
            notes: l.notes || null,
            assignment: l.assignment || null,
            quiz: l.quiz || null,
            codeLink: l.codeLink || "",
            codeUrl: l.codeUrl || "",
          }));

          setLectures(loadedLectures);
          initialData.lectures = loadedLectures;
        } catch (lectureError) {
          console.error("Error loading lectures:", lectureError);
          setLectures([]);
        }
      } else {
        try {
          const chRes = await axios.get(`${API_BASE}/chapters/course/${c._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const rawChaps = chRes.data?.chapters || chRes.data || [];
          
          const loadedChapters = rawChaps.map((ch) => ({
            id: ch._id,
            title: ch.title || "",
            lectures: (ch.lectures || []).map((l) => ({
              id: l._id,
              title: l.title || "",
              thumbnail: l.thumbnail || null,
              video: l.video || null,
              videoFile: null,
              notes: l.notes || null,
              assignment: l.assignment || null,
              quiz: l.quiz || null,
              codeLink: l.codeLink || "",
              codeUrl: l.codeUrl || "",
            })),
          }));

          setChapters(loadedChapters);
          initialData.chapters = loadedChapters;
        } catch (chapterError) {
          console.error("Error loading chapters:", chapterError);
          setChapters([]);
        }
      }

      // ✅ Set loaded state and initial data
      setLastSavedData(initialData);
      setIsDataLoaded(true);
      
    } catch (err) {
      console.error("loadCourse error", err);
      if (err.response?.status === 401) {
        toast.error("Authentication expired. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        toast.error("Course not found.");
        navigate("/instructor/courses");
      } else {
        toast.error("Failed to load course.");
      }
      setIsDataLoaded(true);
    }
  }, [currentCourseId, navigate, token, activeTab, isDataLoaded]);

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

      const res = await axios.post("/api/utils/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { url, publicId } = res.data;

      setForm((prev) => ({
        ...prev,
        thumbnail: { url, publicId }
      }));

      toast.success("Thumbnail uploaded successfully");
    } catch (err) {
      console.error("Thumbnail upload failed", err);
      toast.error(err.response?.data?.message || "Thumbnail upload failed");
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

  /* ------------ clear draft ------------ */
  const clearDraft = () => {
    if (window.confirm('Are you sure you want to clear the draft? This action cannot be undone.')) {
      const draftKey = currentCourseId ? `course-edit-${currentCourseId}` : 'course-draft';
      localStorage.removeItem(draftKey);
      
      if (!currentCourseId) {
        setForm(initialForm);
        setLectures([]);
        setChapters([]);
        setHasDirectLectures(true);
        setActiveTab("basic");
      }
      
      setIsDraftSaved(false);
      setShowDraftNotification(false);
      setLastSavedData(null);
      toast.success('Draft cleared successfully');
    }
  };

  /* ------------ payload build ------------ */
  const buildPayload = () => {
    const payload = {
      title: form.title.trim(),
      slug: form.slug || slugify(form.title),
      shortDescription: form.shortDescription,
      description: form.description,
      category: form.category,
      language: form.language,
      level: form.level,
      thumbnail: form.thumbnail,
      pricing: Number(form.pricing) || 0,
      discount: Number(form.discount) || 0,
      originalPrice: Number(form.originalPrice) || 0,
      includes: form.includes,
      tags: form.tags,
      validity: form.validity,
      status: form.status,
      hasDirectLectures,
    };

    if (hasDirectLectures) {
      payload.lectures = lectures
        .filter(l => l.title.trim() !== '')
        .map((l, i) => ({
          _id: l.id?.startsWith?.("temp-") ? undefined : l.id,
          order: i,
          title: l.title,
          thumbnail: l.thumbnail,
          video: l.video,
          notes: l.notes,
          assignment: l.assignment,
          quiz: l.quiz,
          codeLink: l.codeLink,
          codeUrl: l.codeUrl,
        }));
    } else {
      payload.chapters = chapters
        .filter(ch => ch.title.trim() !== '')
        .map((ch, ci) => ({
          _id: ch.id?.startsWith?.("temp-") ? undefined : ch.id,
          order: ci,
          title: ch.title,
          lectures: ch.lectures
            .filter(l => l.title.trim() !== '')
            .map((l, li) => ({
              _id: l.id?.startsWith?.("temp-") ? undefined : l.id,
              order: li,
              title: l.title,
              thumbnail: l.thumbnail,
              video: l.video,
              notes: l.notes,
              assignment: l.assignment,
              quiz: l.quiz,
              codeLink: l.codeLink,
              codeUrl: l.codeUrl,
            })),
        }));
    }
    
    return payload;
  };

  /* ------------ save ------------ */
  const saveCourse = async ({ publish = false } = {}) => {
    console.log('💾 Save course called:', { publish, saving, token: !!token, title: form.title });

    if (!form.title.trim()) {
      toast.error("Course title is required.");
      setActiveTab("basic");
      return;
    }

    if (!token) {
      toast.error("Authentication required. Please login again.");
      navigate("/login");
      return;
    }

    setSaving(true);
    
    try {
      const payload = buildPayload();
      if (publish) payload.status = "published";

      console.log('📤 Sending payload:', payload);

      if (currentCourseId) {
        const response = await axios.patch(`${API_BASE}/courses/${currentCourseId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Course updated:', response.data);
        toast.success(publish ? "Course published successfully!" : "Course updated successfully!");
        
        setLastSavedData({
          form,
          lectures,
          chapters,
          hasDirectLectures,
          activeTab,
          courseId: currentCourseId,
          timestamp: Date.now()
        });
        
      } else {
        const response = await axios.post(`${API_BASE}/courses`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const newCourse = response.data?.course || response.data;
        const newId = newCourse?._id || newCourse?.id;
        
        console.log('✅ Course created:', newCourse);
        
        if (newId) {
          setCurrentCourseId(newId);
          
          localStorage.removeItem('course-draft');
          
          setLastSavedData({
            form,
            lectures,
            chapters,
            hasDirectLectures,
            activeTab,
            courseId: newId,
            timestamp: Date.now()
          });
          
          setIsDraftSaved(true);
          setShowDraftNotification(false);
          
          toast.success(`Course created successfully! You can now add lectures and content.`);
          setActiveTab("curriculum");
        } else {
          toast.success("Course created successfully!");
        }
      }
    } catch (err) {
      console.error("❌ Save course error:", err);
      
      if (err.response?.status === 401) {
        toast.error("Authentication expired. Please login again.");
        navigate("/login");
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data?.message || "Invalid course data. Please check all fields.";
        toast.error(errorMessage);
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else {
        const errorMessage = err.response?.data?.message || "Failed to save course. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ------------ sticky draft visible? ------------ */
  const showDraftBar = activeTab !== "settings";

  /* ------------ calc draft btn label ------------ */
  const draftLabel = useMemo(
    () => (saving ? "Saving..." : currentCourseId ? "Save Changes" : "Create Draft"),
    [saving, currentCourseId]
  );

  /* ------------ button state debug ------------ */
  const isButtonDisabled = saving || !token || !form.title.trim();

  /* ------------ tab config ------------ */
  const tabs = [
    { key: "basic", label: "Basic Info", icon: <InfoIcon size={16} /> },
    { key: "curriculum", label: "Curriculum", icon: <ListTree size={16} /> },
    { key: "settings", label: "Settings & Pricing", icon: <SettingsIcon size={16} /> },
  ];

  // ✅ Loading state while data is being loaded
  if (!isDataLoaded && currentCourseId) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 text-white">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-blue-300">Loading course data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-white">
      {/* Course Created Success Indicator */}
      {currentCourseId && !courseId && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-300">
              ✅ Course created successfully! You can now add lectures and content
            </span>
          </div>
        </div>
      )}

      {/* Draft notification */}
      {showDraftNotification && isDraftSaved && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-300">
              ✓ Draft restored successfully • Your previous work has been loaded
            </span>
          </div>
          <button 
            onClick={() => setShowDraftNotification(false)}
            className="text-blue-400 hover:text-blue-300 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ✅ ENHANCED: Auto-save indicator */}
      {isDraftSaved && !showDraftNotification && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-green-300">
              Auto-saved • Your progress is protected across all tabs
            </span>
          </div>
          <button 
            onClick={clearDraft}
            className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* heading */}
      <div>
        <h1 className="text-2xl font-bold">
          {currentCourseId ? "Edit Course:" : "Create Course:"}{" "}
          <span className="text-[#f35e33]">{form.title || "Untitled"}</span>
        </h1>
        {user?.userName && (
          <p className="text-sm text-gray-400 mt-1">Instructor: {user.userName}</p>
        )}
        {currentCourseId && (
          <p className="text-xs text-gray-500 mt-1">Course ID: {currentCourseId}</p>
        )}
      </div>

      {/* ✅ FIXED: tab bar with enhanced change handler */}
      <div className="w-full grid grid-cols-3 bg-[#1d1d1b] border border-[#2a2826] rounded-md overflow-hidden text-sm">
        {tabs.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)} // ✅ Use enhanced handler
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
          courseId={currentCourseId}
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
            disabled={isButtonDisabled}
            className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
              isButtonDisabled 
                ? "bg-gray-600 cursor-not-allowed opacity-50" 
                : "bg-[#32312e] hover:bg-[#3a3936] cursor-pointer"
            }`}
          >
            {draftLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
