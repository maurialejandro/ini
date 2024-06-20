import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useState } from "react";

interface FirebaseResponse<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
  listCount?: boolean;
}

interface useFirebaseParams<T> {
  /**
   * Debe de que esta funcion sea una funcion de scope global
   * o una funcion memorizada de useCallback
   */

  getDocsCount: () => Promise<number>;
  getDocsCountFiltered: (
    orderBy: string,
    orderDirection: "asc" | "desc",
    filter?: any
  ) => Promise<number>;

  getData: (
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "asc" | "desc",
    filter?: any
  ) => Promise<FirebaseResponse<T>>;

  getMoreData: (
    lastDoc: QueryDocumentSnapshot<DocumentData>,
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "asc" | "desc",
    filter?: any
  ) => Promise<FirebaseResponse<T>>;

  changeCount?: (c: number, f: boolean) => void;

  filter: any;
  uncontrolledCount?: boolean;
}

export const newUseFirebaseData = <T>(params: useFirebaseParams<T>) => {
  const {
    getDocsCount,
    getDocsCountFiltered,
    getData,
    getMoreData,
    filter,
    uncontrolledCount = true,
    changeCount,
  } = params;

  // PAGINATION UTILS
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderBy, setOrderBy] = useState<string>();
  const [direction, setDirection] = useState<"asc" | "desc">();
  //

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData>>();

  const [data, setData] = useState<T[]>([]);

  const [count, setCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const updateCount = (v: number, f: boolean) => {
    setCount(v);
    if (changeCount) changeCount(v, f);
  };

  const checkFilter = () => {
    let isFilter = false;
    if (filter) {
      if (typeof filter === "object" && Object.keys(filter).length > 0) {
        isFilter = true;
      } else {
        isFilter = false;
      }
    } else {
      isFilter = false;
    }
    return isFilter;
  };

  const getCount = () => {
    const isFilter = checkFilter();
    if (isFilter) {
      setCount(0);
      if (!uncontrolledCount) return;
      getDocsCountFiltered(orderBy as string, direction as any, filter)
        .then((v) => updateCount(v, true))
        .catch((err) => setError(err.toString()));
    } else {
      getDocsCount()
        .then((v) => updateCount(v, false))
        .catch((err) => setError(err.toString()));
    }
  };

  const handleResponse = (
    array: any[],
    lastDoc: QueryDocumentSnapshot<DocumentData>,
    addData: boolean = false,
    listCount: boolean = false
  ) => {
    let count = 0;
    if (addData) {
      const newData = [...data, ...array];
      setData(newData);
    } else {
      count = array.length;
      setData(array);
    }
    setLastDoc(lastDoc);
    const isFilter = checkFilter();
    if (isFilter) setCount(count);
  };

  const setFirebaseForm = (
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "asc" | "desc"
  ) => {
    setRowsPerPage(rowsPerPage);
    setOrderBy(orderBy);
    setDirection(orderDirection);
  };

  const handleLoadData = (
    rowsPerPage: number,
    orderBy: string,
    orderDirection: "asc" | "desc"
  ) => {
    setFirebaseForm(rowsPerPage, orderBy, orderDirection);
    setIsLoading(true);

    getCount();

    getData(rowsPerPage, orderBy, orderDirection, filter)
      .then(({ data, lastDoc, listCount }) =>
        handleResponse(data, lastDoc, false, listCount)
      )
      .catch((err) => setError(err.toString()))
      .finally(() => setIsLoading(false));
  };

  const handleLoadMoreData = () => {
    setIsLoading(true);

    getMoreData(
      lastDoc as any,
      rowsPerPage as number,
      orderBy as string,
      direction as any,
      filter
    )
      .then(({ data, lastDoc }) => handleResponse(data, lastDoc, true))
      .catch((err) => setError(err.toString()))
      .finally(() => setIsLoading(false));
  };

  const handleReload = () => {
    setIsLoading(true);

    getCount();

    getData(rowsPerPage as number, orderBy as string, direction as any, filter)
      .then(({ data, lastDoc, listCount }) =>
        handleResponse(data, lastDoc, false, listCount)
      )
      .catch((err) => setError(err.toString()))
      .finally(() => setIsLoading(false));
  };

  return {
    get: {
      data,
      isLoading,
      error,
      count,
    },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  };
};
