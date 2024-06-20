import { Skeleton, TableCell, TableRow } from "@mui/material";
import React from "react";

interface Props {
  colSpan: number;
  limit: number;
}

const SkeletonTable: React.FC<Props> = ({ colSpan, limit }) => {
  return (
    <>
      {new Array(limit).fill(0).map((x, i) => (
        <TableRow key={i}>
          <TableCell colSpan={colSpan}>
            <Skeleton />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default SkeletonTable;
