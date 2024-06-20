import { useRouter } from "next/router";
import React from "react";
import { useAuth } from "../context/AuthProvider";

import reduceChildRoutes from "./reduceChildRoutes";

const SidebarNavList = (props) => {
  const { pages, depth } = props;
  const router = useRouter();
  const { userData } = useAuth();
  const currentRoute = router.pathname;

  const filterByProfile = (item) => {
    const profiles = item.profile;
    return profiles.includes(userData.Permisos);
  };

  const childRoutes = pages
    .filter((item) => filterByProfile(item))
    .reduce(
      (items, page) => reduceChildRoutes({ items, page, currentRoute, depth }),
      []
    );

  return <React.Fragment>{childRoutes}</React.Fragment>;
};

export default SidebarNavList;
