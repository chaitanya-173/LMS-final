import { NavLink } from "react-router-dom";

const SidebarItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition 
         ${isActive ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-[#292623]"}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default SidebarItem;
