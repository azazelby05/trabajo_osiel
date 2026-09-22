export const isAdmin = (user) => user?.role === "admin";
export const canReport = (user) => user?.role === "admin" || user?.role === "manager";

export const NAV_LINKS = (user) => {
  const links = [
    { to: "/customers", label: "Customers", end: false },
    { to: "/vehicles", label: "Vehicles", end: false },
    { to: "/reservations", label: "Reservations", end: false },
  ];
  if (canReport(user)) links.push({ to: "/reports", label: "Reports", end: false });
  if (isAdmin(user)) links.push({ to: "/users", label: "Users", end: false });
  return links;
};
