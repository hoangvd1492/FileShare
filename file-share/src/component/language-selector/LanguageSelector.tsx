import { Languages } from "lucide-react";

export const LanguagesSelector = () => {
  return (
    <div className="flex flex-row items-center gap-2 ">
      <label htmlFor="lang-selector cursor-pointer">
        <Languages />
      </label>
      <select id="lang-selector cursor-pointer">
        <option value="vi">Vietnamese</option>
      </select>
    </div>
  );
};
