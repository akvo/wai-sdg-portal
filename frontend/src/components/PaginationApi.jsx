import React, { useEffect, useState, useCallback } from 'react';
import api from '../util/api';

const PaginationApi = ({
  apiUrl,
  totalPages = 10,
  perPage = 100,
  callback = null,
}) => {
  const [preload, setPreload] = useState(true);

  const fetchAllPages = useCallback(
    async (page = 2) => {
      const prefixUrl = apiUrl.includes('?') ? '&' : '?';
      const response = await api.get(
        `${apiUrl}${prefixUrl}page=${page}&perpage=${perPage}`
      );
      const { data: apiData } = response.data;
      if (page < totalPages) {
        return apiData?.concat(await fetchAllPages(page + 1));
      }
      return apiData;
    },
    [apiUrl, perPage, totalPages]
  );

  const allCallbacks = useCallback(
    (res) => {
      if (callback) {
        callback(res);
      }
    },
    [callback]
  );

  useEffect(() => {
    if (preload) {
      setPreload(false);
      if (totalPages > 1) {
        fetchAllPages().then((res) => {
          allCallbacks(res);
        });
      }
    }
  }, [preload, totalPages, fetchAllPages, allCallbacks]);

  return <React.Fragment />;
};

export default PaginationApi;
