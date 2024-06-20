import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useAuth } from "../components/context/AuthProvider";
import DashboardLayout from "../components/layouts/Dashboard";

const Home: NextPage = () => {
  return <DashboardLayout></DashboardLayout>;
};

export default Home;
