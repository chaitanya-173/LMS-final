// SettingsTab.jsx
import React, { useState, useMemo } from "react";
import { Check, X } from "lucide-react";

const defaultIncludes = [
  "Assignments",
  "Quizzes",
  "Notes",
  "Code Files",
  "Certificate of Completion",
];

const validityOptions = ["3 Months", "6 Months", "1 Year", "2 Years", "Lifetime"];

const SettingsTab = ({ form, setForm, onPublish, saving }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toggleInclude = (inc) => {
    setForm((p) => {
      const exists = p.includes.includes(inc);
      return { ...p, includes: exists ? p.includes.filter((i) => i !== inc) : [...p.includes, inc] };
    });
  };

  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    setForm((p) => ({ ...p, tags: [...p.tags, t] }));
    setTagInput("");
  };
  const removeTag = (tag) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== tag) }));
  };

  const calcFinalPrice = useMemo(() => {
    const price = Number(form.pricing || 0);
    const discount = Number(form.discount || 0);
    if (!price) return 0;
    if (!discount) return price;
    const discVal = Math.min(Math.max(discount, 0), 100);
    return Math.round(price - (price * discVal) / 100);
  }, [form.pricing, form.discount]);

  return (
    <div className="space-y-8 text-white">
      {/* Pricing */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-200">Price (₹)</label>
          <input
            type="number"
            name="pricing"
            value={form.pricing}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Original Price (display)</label>
          <input
            type="number"
            name="originalPrice"
            value={form.originalPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          />
        </div>
        <div className="md:col-span-4 text-sm text-gray-400">
          Final Price after discount: <span className="text-white font-medium">₹{calcFinalPrice}</span>
        </div>
      </section>

      {/* Includes */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6">
        <h3 className="font-medium mb-2">Course Includes</h3>
        <div className="flex flex-wrap gap-3">
          {defaultIncludes.map((inc) => {
            const active = form.includes.includes(inc);
            return (
              <button
                key={inc}
                type="button"
                onClick={() => toggleInclude(inc)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors
                  ${
                    active
                      ? "bg-[#f35e33] border-[#f35e33] text-white"
                      : "bg-[#1f1d1b] border-[#3a3936] hover:border-[#f35e33]"
                  }`}
              >
                {active ? <Check size={14} className="inline mr-1" /> : null}
                {inc}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tags */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6 space-y-3">
        <h3 className="font-medium mb-2">Tags</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag and press +"
            className="flex-1 px-3 py-2 bg-[#1f1d1b] text-white placeholder-gray-500 border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-[#f35e33] hover:bg-[#ff6f45] rounded-md text-sm"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#1f1d1b] border border-[#3a3936] rounded-md"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                <X size={12} />
              </button>
            </span>
          ))}
          {form.tags.length === 0 && <p className="text-sm text-gray-500">No tags added.</p>}
        </div>
      </section>

      {/* Validity & Status */}
      <section className="bg-[#252523] border border-[#2a2826] rounded-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Validity</label>
          <select
            name="validity"
            value={form.validity}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          >
            {validityOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#1f1d1b] text-white border border-[#3a3936] rounded-md focus:outline-none focus:ring-2 focus:ring-[#f35e33]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </section>

      {/* Publish */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="px-6 py-2 bg-[#f35e33] hover:bg-[#ff6f45] rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : form.status === "published" ? "Update Course" : "Save & Publish"}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
