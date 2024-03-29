import React, { useState, useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Space,
  Upload,
  Button,
  Select,
  message,
  Divider,
  notification,
} from 'antd';
import { FileExcelOutlined, FileExcelTwoTone } from '@ant-design/icons';
import snakeCase from 'lodash/snakeCase';
import moment from 'moment';
import { UIState } from '../../state/ui';
import { DropdownNavigation } from '../../components/common';
import api from '../../util/api';
import config from '../../config';

const { Dragger } = Upload;
const allowedFiles = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const regExpFilename = /filename="(?<filename>.*)"/;
const { notificationText, adminText, buttonText, formText } = window.i18n;

const formIdsFromConfig = Object.keys(window.page_config).map(
  (key) => window.page_config?.[key]?.formId
);

const ManageUpload = () => {
  const { user, administration, activityData, administrationByAccess } =
    UIState.useState((s) => s);
  const [form, setForm] = useState(Object.keys(window.page_config)[0]);
  const [fileName, setFileName] = useState(null);
  const [selectedAdm, setSelectedAdm] = useState(null);
  const [uploadState, setUploadState] = useState(null);
  const [jobState, setJobState] = useState(null);
  const [allForm, setAllForm] = useState([]);
  const [uploading, setUploading] = useState(false);

  const key = 'updatable';

  useEffect(() => {
    api.get('/form/').then((res) => {
      setAllForm(res.data);
    });
  }, []);

  const otherForms = useMemo(() => {
    if (allForm.length) {
      return allForm.filter((d) => !formIdsFromConfig.includes(d.id));
    }
    return [];
  }, [allForm]);

  // { formId: form } only for new form
  const { formId } = config?.[form] || { formId: form };

  const onChange = (info) => {
    setUploading(true);
    const nextState = {};
    switch (info.file.status) {
      case 'uploading':
        message.loading({ content: notificationText?.loadingText, key });
        nextState.selectedFile = info.file;
        nextState.selectedFileList = [info.file];
        break;
      case 'done':
        message.success({
          content: notificationText?.doneText,
          key,
          duration: 2,
        });
        nextState.selectedFile = info.file;
        nextState.file = info.file;
        break;
      default:
        nextState.selectedFile = null;
        nextState.selectedFileList = [];
    }
    setUploadState(() => nextState);
  };

  const onUpload = ({ file, onSuccess }) => {
    const formData = new FormData();
    formData.append('file', file);
    api
      .post(`excel-template/${formId}/${selectedAdm}`, formData)
      .then((res) => {
        onSuccess(res.data);
        setJobState(res.data);
      })
      .catch(() => {
        message.error({
          content: notificationText?.failedText,
          key,
          duration: 2,
        });
      });
  };

  useEffect(() => {
    if (user && selectedAdm) {
      const date = moment().format('YYYYMMDD');
      setFileName([date, formId, snakeCase(user.name)].join('-'));
    }
  }, [user, selectedAdm, formId]);

  useEffect(() => {
    if (uploading && jobState && uploadState?.selectedFile?.status === 'done') {
      setUploading(false);
      UIState.update((e) => {
        e.activityData = {
          ...e.activityData,
          active: true,
          data: activityData.data,
        };
      });
    }
  }, [activityData, jobState, uploadState, uploading]);

  useEffect(() => {
    if (user && administration.length) {
      setSelectedAdm(administration.filter((a) => a.parent === null)[0].id);
    }
  }, [user, administration]);

  const uploadProps = {
    name: fileName,
    multiple: false,
    customRequest: onUpload,
    accept: allowedFiles.join(','),
    onChange: onChange,
    maxCount: 1,
    disabled: fileName ? false : true,
    showUploadList: false,
  };

  const downloadTemplate = () => {
    api
      .get(`excel-template/${formId}`, { responseType: 'blob' })
      .then((res) => {
        const contentDispositionHeader = res.headers['content-disposition'];
        const filename = regExpFilename.exec(contentDispositionHeader)?.groups
          ?.filename;
        if (filename) {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        } else {
          notification.error({
            message: notificationText?.errorText,
          });
        }
      })
      .catch(() => {
        notification.error({
          message: notificationText?.errorText,
        });
      });
  };

  return (
    <div className="main-wrapper">
      <div className="upload-wrapper">
        <Row
          className="filter-wrapper"
          align="middle"
          justify="space-between"
        >
          <Col
            span={24}
            align="center"
          >
            <Space
              size={20}
              align="center"
              wrap={true}
            >
              <h3>{adminText?.dataUploadTemplateDownloadSectionText}</h3>
              <DropdownNavigation
                value={form}
                onChange={setForm}
                otherForms={otherForms}
              />
              <Button onClick={downloadTemplate}>
                {buttonText?.btnDownload}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      <Divider />
      <div className="upload-wrapper">
        <Row
          className="filter-wrapper"
          align="middle"
          justify="space-between"
        >
          <Col
            span={24}
            align="center"
          >
            <Space
              size={20}
              align="center"
              wrap={true}
            >
              <h3>{adminText?.dataUploadSectionText}</h3>
              <DropdownNavigation
                value={form}
                onChange={setForm}
                otherForms={otherForms}
              />
              <Select
                onChange={setSelectedAdm}
                value={selectedAdm}
              >
                {administrationByAccess
                  .filter((a) => a.parent === null)
                  .map((a, ai) => (
                    <Select.Option
                      key={ai}
                      value={a.id}
                    >
                      {a.name}
                    </Select.Option>
                  ))}
              </Select>
            </Space>
          </Col>
        </Row>
        <Row
          className="button-wrapper"
          align="middle"
          justify="space-between"
          wrap={true}
        >
          <Col span={24}>
            <div className="dragger-wrapper">
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  {uploadState?.selectedFile?.status === 'done' ? (
                    <FileExcelTwoTone twoToneColor="#52c41a" />
                  ) : (
                    <FileExcelOutlined />
                  )}
                </p>
                <p className="ant-upload-text">
                  {uploadState?.selectedFile?.status ? (
                    <div className={`${uploadState?.selectedFile?.status}`}>
                      {uploadState.selectedFile.name} -{' '}
                      {uploadState.selectedFile.status}
                    </div>
                  ) : (
                    formText?.inputFilePlaceholder
                  )}
                </p>
                <p className="ant-upload-hint">
                  {formText?.supportExcelFileText}
                </p>
              </Dragger>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ManageUpload;
