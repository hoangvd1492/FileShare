import { LanguagesSelector } from "../language-selector/LanguageSelector";

export const Navbar = () => {
  return (
    <div className="sticky top-0 z-10 bg-[white] app-container h-[var(--navbar-height)] flex flex-row justify-between items-center">
      <h1 className="text-xl font-[900]">FILE SHARE</h1>
      <LanguagesSelector />
    </div>
  );
};
