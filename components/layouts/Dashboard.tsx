import { Box, CssBaseline, Paper as MuiPaper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { spacing } from "@mui/system";
import { useRouter } from "next/router";
import React, { FC, useState } from "react";
import styled from "styled-components/macro";
import { useAuth } from "../../components/context/AuthProvider";
import Footer from "../Footer";
import GlobalStyle from "../GlobalStyles";
import Navbar from "../navbar/Navbar";
import dashboardItems from "../sidebar/dashboardItems";
import Sidebar from "../sidebar/Sidebar";

const drawerWidth = 258;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Drawer = styled.div`
  ${(props) => props.theme.breakpoints.up("md")} {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`;

const AppContent: any = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: calc(
    100% - ${(props: any) => (props.restDrawer ? drawerWidth : 0)}px
  );
`;

const Paper = styled(MuiPaper)(spacing);

const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props) => props.theme.palette.background.default};

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }

  .MuiPaper-root .MuiPaper-root {
    box-shadow: none;
  }
`;

const Dashboard: FC = ({ children }) => {

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const auth = useAuth();
  const router = useRouter();

  if (auth.user === undefined) {
    return <div>Loading</div>;
  }

  if (auth.user === null) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      <Drawer>
        <Box sx={{ display: { xs: "block", lg: "none" } }}>
          <Sidebar
            PaperProps={{ style: { width: drawerWidth } }}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            items={dashboardItems}
          />
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Sidebar
            PaperProps={{ style: { width: drawerWidth } }}
            items={dashboardItems}
          />
        </Box>
      </Drawer>
      <AppContent restDrawer={isMdUp}>
        <Navbar onDrawerToggle={handleDrawerToggle} />
        <MainContent p={isLgUp ? 10 : 5}>{children}</MainContent>
        <Footer />
      </AppContent>
      {/* <Settings /> */}
    </Root>
  );
};

export default Dashboard;
