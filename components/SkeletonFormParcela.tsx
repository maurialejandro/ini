import { Box, Grid, Skeleton, TextField, Typography } from "@mui/material";
import React from "react";

function SkeletonFormParcela() {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2}>
              <Typography
                variant="body2"
                style={{ fontWeight: 500 }}
              ></Typography>
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2}>
              <Typography
                variant="body2"
                style={{ fontWeight: 500 }}
              ></Typography>
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1"></Typography>
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2} mr={2}>
              <TextField variant="outlined" autoComplete="off" fullWidth />
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2} mr={2}>
              <TextField variant="outlined" autoComplete="off" fullWidth />
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2} mr={2}>
              <TextField variant="outlined" autoComplete="off" fullWidth />
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2} mr={2}>
              <TextField variant="outlined" autoComplete="off" fullWidth />
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2} mr={2}>
              <TextField variant="outlined" autoComplete="off" fullWidth />
            </Box>
          </Box>
        </Skeleton>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Skeleton>
          <Box display="flex" sx={{ flexDirection: "column" }}>
            <Box mt={1}>
              <Typography variant="caption"></Typography>
            </Box>
            <Box mt={1} mb={2} mr={2}>
              <TextField variant="outlined" autoComplete="off" fullWidth />
            </Box>
          </Box>
        </Skeleton>
      </Grid>
    </Grid>
  );
}

export default SkeletonFormParcela;
