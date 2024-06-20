import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

interface useFirebaseParams<T> {
  /**
   * Debe de que esta funcion sea una funcion de scope global
   * o una funcion memorizada de useCallback
   */
  getData: () => Promise<T[]>;
  getCount: () => Promise<number>;
  rows: number;
  onRequestSort: (property: string, direction: "asc" | "desc") => Promise<T[]>;
  onLoadMore: (lastDoc: QueryDocumentSnapshot<DocumentData>) => Promise<T[]>;
}

export const useFirebaseData = <T>(params: useFirebaseParams<T>) => {
  const { getData, onRequestSort, onLoadMore, getCount, rows } = params;

  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData>>();

  const [data, setData] = useState<T[]>([]);

  const [count, setCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {}, []);

  useEffect(() => {
    setIsLoading(true);
    console.log("Getting data");

    getCount()
      .then(setCount)
      .catch((err) => setError(err.toString()));
    getData()
      .then((data) => {
        console.log("searched:", data.length);
        setData(data);
      })
      .catch((err) => setError(err.toString()))
      .finally(() => setIsLoading(false));
  }, [rows]);

  const handleSort = (property: string, direction: "desc" | "asc") => {
    setIsLoading(true);

    onRequestSort(property, direction)
      .then(setData)
      .catch((err) => setError(err.toString()))
      .finally(() => setIsLoading(false));
  };
  const handleLoadMore = () => {
    onLoadMore(lastDoc as any)
      .then((moreData) => {})
      .catch((err) => setError(err.toString()))
      .finally(() => setIsLoading(false));
  };

  const handleReload = () => {
    setIsLoading(true);
    console.log("reaload");

    getData()
      .then(setData)
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
    handleSort,
    handleReload,
    handleLoadMore,
  };
};
