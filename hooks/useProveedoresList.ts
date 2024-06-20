import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useState } from "react";
import {
  getCountProviders,
  getExportProviders,
  getMoreProviders,
  getProviders,
} from "../services/firestore/proveedores";

export interface Props {
  filtro: any;
}

export const useProveedoresList = ({ filtro: f }: Props) => {
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

  const loadProviders = async (
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "desc" | "asc",
    filter?: any
  ) => {
    const useFilter = checkFilter();
    setIsFilter(useFilter);
    let res = getProviders(
      useFilter ? 999 : rowsPerPage,
      orderBy,
      orderDirection,
      filter
    );

    return res;
  };

  const loadMoreProviders = async (
    lastDoc: QueryDocumentSnapshot<DocumentData>,
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "desc" | "asc",
    filter?: any
  ) => {
    if (isFilter) return { data: [], lastDoc };

    const res = getMoreProviders(
      lastDoc,
      rowsPerPage,
      orderBy,
      orderDirection,
      filter
    );
    return res;
  };

  const loadCount = async () => {
    const res = getCountProviders();
    return res;
  };

  const loadExportData = async () => {
    let res;
    if (isFilter) {
      res = await getExportProviders(f);
    } else {
      res = await getExportProviders();
    }
    return res;
  };

  return {
    loadProviders,
    loadMoreProviders,
    loadCount,
    loadExportData,
  };
};
