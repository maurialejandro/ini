import React from "react";
import styled from "styled-components/macro";

import { Badge, Grid, Avatar, Typography } from "@mui/material";
import { useAuth } from "../context/AuthProvider";

const Footer = styled.div`
  background-color: ${(props) =>
    props.theme.sidebar.footer.background} !important;
  padding: ${(props) => props.theme.spacing(2.75)}
    ${(props) => props.theme.spacing(4)};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const FooterText = styled(Typography)`
  color: ${(props) => props.theme.sidebar.footer.color};
`;

const FooterSubText = styled(Typography)`
  color: ${(props) => props.theme.sidebar.footer.color};
  font-size: 0.7rem;
  display: block;
  padding: 1px;
`;

const FooterBadge = styled(Badge)`
  margin-right: ${(props) => props.theme.spacing(1)};
  span {
    background-color: ${(props) =>
      props.theme.sidebar.footer.online.background};
    border: 1.5px solid ${(props) => props.theme.palette.common.white};
    height: 12px;
    width: 12px;
    border-radius: 50%;
  }
`;

const SidebarFooter = ({ ...rest }) => {
  const { user, userData } = useAuth();

  return (
    <Footer {...rest}>
      <Grid container spacing={2}>
        <Grid item>
          <FooterBadge
            overlap="circular"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            variant="dot"
          >
            {!!user && <Avatar alt={user.displayName} src={user.photoURL} />}
            {/* Demo data */}
            {/* {!user && (
              <Avatar
                alt="Lucy Lavender"
                src="/static/img/avatars/avatar-1.jpg"
              />
            )} */}
          </FooterBadge>
        </Grid>
        <Grid item>
          {user && <FooterText variant="body2">{user.email}</FooterText>}
          {userData && (
            <FooterText variant="body2">{userData.Permisos}</FooterText>
          )}
          {/* Demo data */}
          {!user && <FooterText variant="body2">Lucy Lavender</FooterText>}
        </Grid>
      </Grid>
    </Footer>
  );
};

export default SidebarFooter;
