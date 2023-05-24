import React, { useEffect, useState } from 'react';
import api from '../util/api';

const PaginationApi = ({
  apiUrl,
  totalPages = 10,
  perPage = 100,
  callback = null,
}) => {
  const [preload, setPreload] = useState(true);

  const fetchAllPages = async (page = 2) => {
    const prefixUrl = apiUrl.includes('?') ? '&' : '?';
    const response = await api.get(
      `${apiUrl}${prefixUrl}page=${page}&perpage=${perPage}`
    );
    const { data: apiData } = response.data;
    if (page < totalPages) {
      return apiData?.concat(await fetchAllPages(page + 1));
    }
    return apiData;
  };

  useEffect(() => {
    if (preload) {
      setPreload(false);
      fetchAllPages().then((res) => {
        if (callback) {
          callback(res);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preload]);

  return <React.Fragment />;
};

export default PaginationApi;
