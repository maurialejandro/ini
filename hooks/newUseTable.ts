import { useEffect, useState } from "react";

export interface useTableParams<T extends { id: string }> {
  rows: T[];
  totalDocs: number;
  filter?: any;
  defaultOrderBy?: string;
  onRequestSort: (
    rowsPerPage: number,
    property: string,
    direction: "desc" | "asc"
  ) => void;
  onChangeRowsPerPage: (
    rowsPerPage: number,
    property: string,
    direction: "desc" | "asc"
  ) => void;
  onChangePage?: () => void;
  onLoad?: (
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "asc" | "desc",
    filter?: any
  ) => void;
  defaultSortOrder?: "asc" | "desc";
}

export const newUseTable = <T extends { id: string }>(
  params: useTableParams<T>
) => {
  const {
    rows,
    totalDocs,
    defaultOrderBy,
    defaultSortOrder = "desc",
    onRequestSort,
    onChangeRowsPerPage,
    onChangePage,
    onLoad,
    filter,
  } = params;
  const [orderBy, setOrderBy] = useState(defaultOrderBy || "");
  const [order, setOrder] = useState<"desc" | "asc" | undefined>(
    defaultSortOrder
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

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
    const thisPage = newPage;
    onChangePage &&
      rows.length < totalDocs &&
      thisPage > page &&
      onChangePage();
    setPage(thisPage);
  };

  useEffect(() => {
    page !== 0 && setPage(0);
  }, [totalDocs]);

  const handleChangeRowsPerPage = (event: any) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    onChangeRowsPerPage(newRowsPerPage, orderBy, order as any);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    onRequestSort(rowsPerPage, property, isAsc ? "desc" : "asc");
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  useEffect(() => {
    onLoad && onLoad(rowsPerPage, orderBy, order as any, filter);
  }, []);

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
    order,
    handleRequestSort,
  };
};
