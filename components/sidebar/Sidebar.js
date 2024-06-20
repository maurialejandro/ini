import {
  Box as MuiBox,
  Chip,
  Drawer as MuiDrawer,
  ListItemButton,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { spacing } from "@mui/system";
import Image from "next/image";
import React from "react";
import styled from "styled-components/macro";
import ImgLogo from "../../public/logo-inia-blanco.svg";
import Footer from "./SidebarFooter";
import SidebarNav from "./SidebarNav";

const Box = styled(MuiBox)(spacing);

const Drawer = styled(MuiDrawer)`
  border-right: 0;

  > div {
    border-right: 0;
  }
`;

const Brand = styled(ListItemButton)`
  font-size: ${(props) => props.theme.typography.h5.fontSize};
  font-weight: ${(props) => props.theme.typography.fontWeightMedium};
  color: ${(props) => props.theme.sidebar.header.color};
  background-color: ${(props) => props.theme.sidebar.header.background};
  font-family: ${(props) => props.theme.typography.fontFamily};
  min-height: 56px;
  padding-left: ${(props) => props.theme.spacing(6)};
  padding-right: ${(props) => props.theme.spacing(6)};
  justify-content: center;
  cursor: pointer;
  flex-grow: 0;

  ${(props) => props.theme.breakpoints.up("sm")} {
    min-height: 64px;
  }

  &:hover {
    background-color: ${(props) => props.theme.sidebar.header.background};
  }
`;
/* 
  #76a747 (verde)
  #cd0d89 (fucsia)
  #e4e3e3 (gris inputs)
  #f3f2f2 (gris fondo logos footer)
  #e7e7e7 (gris botones con +)
  #000 (textos)
*/
// TODO: cuando se importe el icono
// const BrandIcon = styled(Logo)`
//   margin-right: ${(props) => props.theme.spacing(2)};
//   color: ${(props) => props.theme.sidebar.header.brand.color};
//   fill: ${(props) => props.theme.sidebar.header.brand.color};
//   width: 32px;
//   height: 32px;
// `;

const BrandChip = styled(Chip)`
  background-color: ${green[700]};
  border-radius: 5px;
  color: ${(props) => props.theme.palette.common.white};
  font-size: 55%;
  height: 18px;
  margin-left: 2px;
  margin-top: -16px;
  padding: 3px 0;

  span {
    padding-left: ${(props) => props.theme.spacing(1.375)};
    padding-right: ${(props) => props.theme.spacing(1.375)};
  }
`;

const Sidebar = ({ items, showFooter = true, ...rest }) => {
  return (
    <Drawer variant="permanent" {...rest}>
      <Brand>
        <Box mt={6}>
          <Image
            src={ImgLogo}
            width={ImgLogo.width * 0.5}
            height={ImgLogo.height * 0.5}
          />
        </Box>
      </Brand>
      <SidebarNav items={items} />
      {!!showFooter && <Footer />}
    </Drawer>
  );
};

export default Sidebar;
