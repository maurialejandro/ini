import { useState } from "react";

export interface useTableParams<T extends { id: string }> {
  rows: T[];
  defaultOrderBy?: string;
  onRequestSort?: (property: string, direction: "desc" | "asc") => void;
  onChangePage?: () => void;
}

export const useTable = <T extends { id: string }>(
  params: useTableParams<T>
) => {
  const { rows, defaultOrderBy, onRequestSort, onChangePage } = params;
  const [orderBy, setOrderBy] = useState(defaultOrderBy || "");
  const [order, setOrder] = useState<"desc" | "asc" | undefined>("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSelectAllClick = (event: any) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClickSelect = (event: any, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
    onChangePage && onChangePage();
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    if (onRequestSort) onRequestSort(property, isAsc ? "desc" : "asc");
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return {
    rowsSelected: selected,
    page,
    rowsPerPage,
    handleSelectAllClick,
    handleClickSelect,
    handleChangePage,
    handleChangeRowsPerPage,
    isSelected,
    emptyRows,
    orderBy,
    // setOrderBy,
    order,
    handleRequestSort,
  };
};
