// * REUSABLE FORM COMPONENT THAT RENDERS FORM CONTROLS AND A SUBMIT BUTTON

import React from "react";
import { Button } from "../ui/button";
import FormControls from "./form-controls";

const CommonForm = ({ handleSubmit, buttonText, formControls = [], formData, setFormData,
  isButtonDisabled = false }) => {
  return (
    <form action="" onSubmit={handleSubmit}>
      {/* render form controls here */}
      <FormControls formControls={formControls} formData={formData} setFormData={setFormData} />
      <Button disabled={isButtonDisabled} type="submit" className="mt-5 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
};

export default CommonForm;
