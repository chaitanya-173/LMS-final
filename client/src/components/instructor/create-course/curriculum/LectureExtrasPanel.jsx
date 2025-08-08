import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import NotesForm from "./forms/NotesForm";
import AssignmentForm from "./forms/AssignmentForm";
import QuizForm from "./forms/QuizForm";
import CodeLinkForm from "./forms/CodeLinkForm";

const LectureExtrasPanel = ({ open, lectureId, type, onClose, onSave }) => {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false); // ✅ NEW: Loading state

  useEffect(() => {
    if (!open || !lectureId) return;
    
    // ✅ Reset state when modal opens
    setData(null);
    setSaving(false);
    
    console.log('🔧 LectureExtrasPanel opened:', { lectureId, type });
  }, [open, lectureId, type]);

  // ✅ NEW: Enhanced form save handler
  const handleFormSave = async (formData) => {
    if (saving) return; // Prevent double submission
    
    try {
      setSaving(true);
      console.log('💾 Saving form data:', { lectureId, type, formData });
      
      // ✅ Call parent's onSave with proper parameters
      await onSave(lectureId, type, formData);
      
      // ✅ Show success feedback and close modal
      setTimeout(() => {
        onClose();
        setSaving(false);
      }, 800); // Give time for toast to show
      
    } catch (error) {
      console.error('❌ Form save error:', error);
      setSaving(false);
      // Error toast should be handled by the form or parent
    }
  };

  // ✅ NEW: Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose, saving]);

  if (!open) return null;

  // ✅ NEW: Get type-specific configuration
  const getTypeConfig = () => {
    const configs = {
      notes: {
        title: "📄 Add Notes",
        description: "Upload PDF notes for this lecture",
        icon: "📄"
      },
      assignment: {
        title: "📝 Add Assignment", 
        description: "Create an assignment with deadline and instructions",
        icon: "📝"
      },
      quiz: {
        title: "❓ Create Quiz",
        description: "Add interactive quiz questions for students",
        icon: "❓"
      },
      code: {
        title: "💻 Add Code Link",
        description: "Link to GitHub, GitLab, or other code repository",
        icon: "💻"
      }
    };
    return configs[type] || { title: `Edit ${type}`, description: "", icon: "📋" };
  };

  const typeConfig = getTypeConfig();

  const renderForm = () => {
    // ✅ Common props for all forms
    const commonProps = {
      lectureId,
      disabled: saving,
      existingData: data,
    };

    switch (type) {
      case "notes":
        return (
          <NotesForm 
            {...commonProps}
            onSave={handleFormSave}
          />
        );
      case "assignment":
        return (
          <AssignmentForm 
            {...commonProps}
            onSave={handleFormSave}
          />
        );
      case "quiz":
        return (
          <QuizForm 
            {...commonProps}
            onSave={handleFormSave}
          />
        );
      case "code":
        return (
          <CodeLinkForm 
            {...commonProps}
            onSubmit={handleFormSave} // ✅ FIXED: CodeLinkForm uses onSubmit
          />
        );
      default:
        return (
          <div className="text-center py-8">
            <div className="text-red-400 text-lg mb-2">⚠️ Invalid Type</div>
            <p className="text-gray-400">Unknown content type: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ✅ ENHANCED: Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={!saving ? onClose : undefined} // Disable close when saving
      />

      {/* ✅ ENHANCED: Panel with better responsive design */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1f1d1b] border border-[#2a2826] rounded-xl shadow-2xl z-10 overflow-hidden">
        
        {/* ✅ NEW: Enhanced Header */}
        <div className="sticky top-0 bg-[#1f1d1b] border-b border-[#2a2826] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeConfig.icon}</span>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {typeConfig.title}
              </h2>
              {typeConfig.description && (
                <p className="text-sm text-gray-400 mt-1">
                  {typeConfig.description}
                </p>
              )}
            </div>
          </div>
          
          <button
            className={`p-2 rounded-md transition-all duration-200 ${
              saving 
                ? "opacity-50 cursor-not-allowed bg-gray-600"
                : "hover:bg-[#2a2826] text-gray-300 hover:text-white"
            }`}
            onClick={!saving ? onClose : undefined}
            disabled={saving}
            title={saving ? "Saving..." : "Close (Esc)"}
          >
            <X size={20} />
          </button>
        </div>

        {/* ✅ NEW: Saving Indicator */}
        {saving && (
          <div className="bg-blue-900/30 border-b border-blue-500/30 p-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-300 text-sm font-medium">
              Saving {type}... Please wait
            </span>
          </div>
        )}

        {/* ✅ ENHANCED: Content area with proper scrolling */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default LectureExtrasPanel;
