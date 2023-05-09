import api from './api';
import { UIState } from '../state/ui';
const { notificationText } = window.i18n;

const jobStatus = {
  on_progress: {
    icon: 'warning',
    status: notificationText?.statusWaitingValidationText,
  },
  pending: {
    icon: 'warning',
    status: notificationText?.statusWaitingValidationText,
  },
  failed: {
    icon: 'danger',
    status: notificationText?.statusFailedValidationText,
  },
  done: {
    icon: 'success',
    status: notificationText?.statusSuccessValidationText,
  },
};

export const getJobsApi = (page = 1) => {
  UIState.update((e) => {
    e.activityData = {
      ...e.activityData,
      loading: true,
    };
  });
  api
    .get(`jobs/current-user?page=${page}`)
    .then(({ data: apiData }) => {
      UIState.update((e) => {
        const data = apiData?.data?.map((d) => {
          const jst = jobStatus[d?.status] || jobStatus.done;
          return {
            ...d,
            file: d?.info?.original_filename,
            status: jst.status,
            icon: jst.icon,
            attachment: d?.payload,
          };
        });
        e.activityData = {
          ...e.activityData,
          ...apiData,
          data: e.activityData?.data?.concat(data),
          loading: false,
        };
      });
    })
    .catch(() => {
      UIState.update((e) => {
        e.activityData = {
          ...e.activityData,
          loading: false,
        };
      });
    });
};
