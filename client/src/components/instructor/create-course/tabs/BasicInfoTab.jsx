// BasicInfoTab.jsx
import React from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

const BasicInfoTab = ({ form, setForm, onGenerateSlug, onThumbnailSelect, uploading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="space-y-8 text-white">
      {/* Basic Info */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6 space-y-6">
        <header>
          <h2 className="text-lg font-semibold mb-1">Basic Info</h2>
          <p className="text-sm text-gray-400">Provide basic information about the course.</p>
        </header>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Create a SaaS using Next.js 15"
              className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
            />
          </div>

          {/* Slug + Generate */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-200">Slug</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-title"
                className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
              />
            </div>
            <button
              type="button"
              onClick={onGenerateSlug}
              className="px-3 py-2 text-sm bg-[#f35e33] hover:bg-[#ff6f45] rounded-md font-medium transition-colors"
            >
              Generate
            </button>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Short Description</label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              rows={3}
              placeholder="One-line summary..."
              className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Description</label>
            {/* Replace with rich text editor later */}
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={8}
              placeholder="Full course description..."
              className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
            />
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      <section className="bg-[#252523] border border-dashed border-[#f35e33]/40 rounded-md p-6 text-center space-y-4">
        <h3 className="font-medium text-white">Thumbnail Image</h3>
        <p className="text-sm text-gray-400">Upload a banner/thumbnail for your course.</p>
        <div className="flex flex-col items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#1f1d1b] border border-[#3a3936] rounded-md hover:border-[#f35e33] transition-colors text-sm">
            <UploadCloud size={18} />
            <span>Select Image</span>
            <input type="file" accept="image/*" hidden onChange={onThumbnailSelect} />
          </label>
          {uploading ? (
            <span className="text-xs text-gray-400">Uploading...</span>
          ) : form.thumbnailUrl ? (
            <img
              src={form.thumbnailUrl}
              alt="Course thumbnail"
              className="max-h-40 rounded-md border border-[#3a3936] object-contain"
            />
          ) : (
            <ImageIcon size={32} className="text-gray-500" />
          )}
        </div>
      </section>

      {/* Category / Language / Level */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Cybersecurity, Programming..."
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Language</label>
          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            placeholder="English"
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Level</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </section>
    </div>
  );
};

export default BasicInfoTab;
