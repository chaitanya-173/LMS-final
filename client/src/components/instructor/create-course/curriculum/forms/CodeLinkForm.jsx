import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, Github, ExternalLink } from "lucide-react";

const CodeLinkForm = ({ onSubmit, existingData = null }) => {
  const [codeLink, setCodeLink] = useState(existingData?.codeLink || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!codeLink.trim()) {
      toast.error("Please provide a code link");
      return;
    }

    // Basic URL validation
    try {
      new URL(codeLink);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    // ✅ Pass data to parent component for local state management
    const codeData = {
      codeLink: codeLink.trim(),
      platform: detectPlatform(codeLink),
    };

    onSubmit?.(codeData);
    toast.success("Code link saved!");
  };

  const detectPlatform = (url) => {
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('gitlab.com')) return 'GitLab';
    if (url.includes('bitbucket.org')) return 'Bitbucket';
    if (url.includes('codepen.io')) return 'CodePen';
    if (url.includes('codesandbox.io')) return 'CodeSandbox';
    return 'Other';
  };

  const getPlatformIcon = (url) => {
    if (url.includes('github.com')) return <Github size={18} />;
    return <Link size={18} />;
  };

  const testLink = () => {
    if (codeLink.trim()) {
      window.open(codeLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2826] rounded-xl p-4 space-y-4 text-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link size={18} className="text-[#f35e33]" />
          <h4 className="font-medium">Code Repository Link</h4>
        </div>

        {/* Input */}
        <div>
          <label className="block mb-1 font-medium text-sm">
            Repository URL*
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://github.com/username/repository"
              value={codeLink}
              onChange={(e) => setCodeLink(e.target.value)}
              className="w-full p-3 bg-[#2a2826] rounded outline-none focus:ring-2 focus:ring-[#f35e33] transition pr-10"
              required
            />
            {codeLink && (
              <button
                type="button"
                onClick={testLink}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#f35e33] transition"
                title="Test link"
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>
          
          {/* Platform Detection */}
          {codeLink && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              {getPlatformIcon(codeLink)}
              <span>Platform: {detectPlatform(codeLink)}</span>
            </div>
          )}
        </div>

        {/* Common Platforms Help */}
        <div className="bg-[#2a2826] p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Supported platforms:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>• GitHub</span>
            <span>• GitLab</span>
            <span>• Bitbucket</span>
            <span>• CodePen</span>
            <span>• CodeSandbox</span>
            <span>• Other Git repositories</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#f35e33] hover:bg-[#e14e27] transition text-white px-4 py-2 rounded w-full font-medium"
        >
          Save Code Link
        </button>
      </form>
    </div>
  );
};

export default CodeLinkForm;
