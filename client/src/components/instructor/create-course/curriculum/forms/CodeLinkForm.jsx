import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";

const CodeLinkForm = ({ onSubmit }) => {
  const [codeLink, setCodeLink] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!codeLink.trim()) {
      toast.error("Please provide a code link before submitting.");
      return;
    }

    onSubmit({ codeLink });
    setCodeLink("");
  };

  return (
    <Card className="p-6 rounded-2xl bg-[#1f1f1f] text-white shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="codeLink" className="text-white">
            Code Link
          </Label>
          <Input
            id="codeLink"
            type="url"
            placeholder="https://github.com/..."
            value={codeLink}
            onChange={(e) => setCodeLink(e.target.value)}
            className="bg-[#2a2a2a] text-white border border-neutral-700"
          />
        </div>
        <Button
          type="submit"
          className="bg-[#f35e33] hover:bg-[#d64c27] w-fit text-white"
        >
          Upload Code
        </Button>
      </form>
    </Card>
  );
};

export default CodeLinkForm;
