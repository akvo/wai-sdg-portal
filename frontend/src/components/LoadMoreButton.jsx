import React from 'react';
import { Button } from 'antd';
import { UIState } from '../state/ui';
import { getJobsApi } from '../util/endpoints';

const { btnLoadMore } = window.i18n.buttonText;

const LoadMoreButton = ({ reached = true }) => {
  const { current } = UIState.useState((s) => s?.activityData);

  const handleOnClick = () => {
    const nextPage = parseInt(current, 10) + 1;
    getJobsApi(nextPage);
  };
  return !reached ? (
    <div className="activity-log-more">
      {reached ? null : <Button onClick={handleOnClick}>{btnLoadMore}</Button>}
    </div>
  ) : null;
};

export default LoadMoreButton;
