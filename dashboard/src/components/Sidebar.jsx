import React, { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { FaBoxes, FaFileInvoiceDollar, FaClipboardList } from "react-icons/fa";
import { MdAddModerator, MdMedicalServices } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import { MdBarChart } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get("https://vasudev-hospital-management-system.onrender.com/api/v1/user/admin/logout", { withCredentials: true });
      toast.success(res.data.message);
      setIsAuthenticated(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const go = (path) => { navigate(path); setShow(false); };

  const links = [
    { icon: <TiHome />, label: "Dashboard", path: "/" },
    { icon: <MdBarChart />, label: "Analytics", path: "/analytics" },
    { icon: <FaUserDoctor />, label: "Doctors", path: "/doctors" },
    { icon: <MdMedicalServices />, label: "Medical Records", path: "/medical-records" },
    { icon: <FaClipboardList />, label: "Prescriptions", path: "/prescriptions" },
    { icon: <FaFileInvoiceDollar />, label: "Billing", path: "/billing" },
    { icon: <FaBoxes />, label: "Inventory", path: "/inventory" },
    { icon: <AiFillMessage />, label: "Messages", path: "/messages" },
    { icon: <MdAddModerator />, label: "Add Admin", path: "/admin/addnew" },
    { icon: <IoPersonAddSharp />, label: "Add Doctor", path: "/doctor/addnew" },
  ];

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
      >
        <div className="links">
          {links.map(({ icon, label, path }) => (
            <div key={path} title={label} onClick={() => go(path)} style={{ cursor: "pointer" }}>
              {icon}
            </div>
          ))}
          <div title="Audit Logs" onClick={() => go("/audit-logs")} style={{ cursor: "pointer" }}>
            <AiFillMessage style={{ color: "#d69e2e" }} />
          </div>
          <RiLogoutBoxFill onClick={handleLogout} style={{ cursor: "pointer" }} title="Logout" />
        </div>
      </nav>
      <div
        className="wrapper"
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
