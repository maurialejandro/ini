import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useState } from "react";

import {
  getCharges,
  getCountCharges,
  getExportCharges,
  getMoreCharges,
} from "../services/firestore/cargos";

export interface Props {
  filtro: any;
}

export const useCargosList = ({ filtro: f }: Props) => {
  const [isFilter, setIsFilter] = useState(false);

  const checkFilter = () => {
    let isFilter = false;
    if (f) {
      if (typeof f === "object" && Object.keys(f).length > 0) {
        isFilter = true;
      } else {
        isFilter = false;
      }
    } else {
      isFilter = false;
    }
    return isFilter;
  };

  const loadCharges = async (
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "desc" | "asc",
    filter?: any
  ) => {
    const useFilter = checkFilter();
    setIsFilter(useFilter);
    let res = getCharges(
      useFilter ? 999 : rowsPerPage,
      orderBy,
      orderDirection,
      filter
    );

    return res;
  };

  const loadMoreCharges = async (
    lastDoc: QueryDocumentSnapshot<DocumentData>,
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "desc" | "asc",
    filter?: any
  ) => {
    if (isFilter) return { data: [], lastDoc };

    const res = getMoreCharges(
      lastDoc,
      rowsPerPage,
      orderBy,
      orderDirection,
      filter
    );
    return res;
  };

  const loadCount = async () => {
    const res = getCountCharges();
    return res;
  };

  const loadExportData = async () => {
    let res;
    if (isFilter) {
      res = await getExportCharges(f);
    } else {
      res = await getExportCharges();
    }
    return res;
  };

  return {
    loadCharges,
    loadMoreCharges,
    loadCount,
    loadExportData,
  };
};
