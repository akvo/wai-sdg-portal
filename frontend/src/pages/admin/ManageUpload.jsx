import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Space,
  Upload,
  Button,
  Select,
  message,
  notification,
} from "antd";
import { FileExcelOutlined, FileExcelTwoTone } from "@ant-design/icons";
import snakeCase from "lodash/snakeCase";
import moment from "moment";
import { UIState } from "../../state/ui";
import { DropdownNavigation } from "../../components/common";
import api from "../../util/api";
import axios from "axios";
import config from "../../config";

const { Dragger } = Upload;
const allowedFiles = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const regExpFilename = /filename="(?<filename>.*)"/;

const checkJobs = (id, filename) => {
  axios.get(`/worker/jobs/status/${id}`).then(function (res) {
    const status = res.data.status;
    if (status === "on_progress" || status === "pending") {
      UIState.update((e) => {
        e.activityLog = [
          {
            id: id,
            file: filename,
            status: "Waiting for validation",
            icon: "warning",
          },
          ...e.activityLog.filter((x) => x.id !== id),
        ];
      });
      setTimeout(() => {
        checkJobs(id, filename);
      }, 10000);
    } else if (status === "failed") {
      UIState.update((e) => {
        e.activityLog = [
          {
            id: id,
            file: filename,
            status: "Failed",
            icon: "danger",
            attachment: res.data.attachment,
          },
          ...e.activityLog,
        ];
      });
    } else {
      UIState.update((e) => {
        e.activityLog = [
          {
            id: id,
            file: filename,
            status: "Submitted",
            icon: "success",
          },
          ...e.activityLog,
        ];
      });
    }
  });
};

const ManageUpload = () => {
  const {
    user,
    administration,
    activityLog,
    administrationByAccess,
  } = UIState.useState((s) => s);
  const [form, setForm] = useState(Object.keys(window.page_config)[0]);
  const [fileName, setFileName] = useState(null);
  const { formId } = config[form];
  const [selectedAdm, setSelectedAdm] = useState(null);
  const [uploadState, setUploadState] = useState(null);
  const [jobState, setJobState] = useState(null);

  const key = "updatable";

  const onChange = (info) => {
    const nextState = {};
    switch (info.file.status) {
      case "uploading":
        message.loading({ content: "Loading...", key });
        nextState.selectedFile = info.file;
        nextState.selectedFileList = [info.file];
        break;
      case "done":
        message.success({ content: "Done!", key, duration: 2 });
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
    let formData = new FormData();
    formData.append("file", file);
    api
      .post(`excel-template/${formId}/${selectedAdm}`, formData)
      .then((res) => {
        onSuccess(res.data);
        setJobState(res.data);
      })
      .catch((err) => {
        message.error({ content: "Failed", key, duration: 2 });
      });
  };

  useEffect(() => {
    if (user && selectedAdm) {
      const date = moment().format("YYYYMMDD");
      setFileName([date, formId, snakeCase(user.name)].join("-"));
    }
  }, [user, selectedAdm, formId]);

  useEffect(() => {
    if (jobState && uploadState?.selectedFile?.status === "done") {
      const op = activityLog.find((x) => x.id === jobState.id);
      if (!op) {
        checkJobs(jobState.id, uploadState.selectedFile.name);
      }
    }
  }, [activityLog, jobState, uploadState]);

  useEffect(() => {
    if (user && administration.length) {
      setSelectedAdm(administration.filter((a) => a.parent === null)[0].id);
    }
  }, [user, administration]);

  const uploadProps = {
    name: fileName,
    multiple: false,
    customRequest: onUpload,
    accept: allowedFiles.join(","),
    onChange: onChange,
    maxCount: 1,
    disabled: fileName ? false : true,
    showUploadList: false,
  };

  const downloadTemplate = () => {
    api
      .get(`excel-template/${formId}`, { responseType: "blob" })
      .then((res) => {
        const contentDispositionHeader = res.headers["content-disposition"];
        const filename = regExpFilename.exec(contentDispositionHeader)?.groups
          ?.filename;
        if (filename) {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
        } else {
          notification.error({
            message: "Something wen't wrong",
          });
        }
      })
      .catch(() => {
        notification.error({
          message: "Something wen't wrong",
        });
      });
  };

  return (
    <div className="main-wrapper">
      <div className="upload-wrapper">
        <Row className="filter-wrapper" align="middle" justify="space-between">
          <Col span={24} align="center">
            <Space size={20} align="center" wrap={true}>
              <h3>
                If you do not already have a template file, please download it
              </h3>
              <DropdownNavigation value={form} onChange={setForm} />
              <Button onClick={downloadTemplate}>Download</Button>
            </Space>
          </Col>
        </Row>
      </div>
      <div className="upload-wrapper">
        <Row className="filter-wrapper" align="middle" justify="space-between">
          <Col span={24} align="center">
            <Space size={20} align="center" wrap={true}>
              <h3>Upload your data</h3>
              <DropdownNavigation value={form} onChange={setForm} />
              <Select onChange={setSelectedAdm} value={selectedAdm}>
                {administrationByAccess
                  .filter((a) => a.parent === null)
                  .map((a, ai) => (
                    <Select.Option key={ai} value={a.id}>
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
                  {uploadState?.selectedFile?.status === "done" ? (
                    <FileExcelTwoTone twoToneColor="#52c41a" />
                  ) : (
                    <FileExcelOutlined />
                  )}
                </p>
                <p className="ant-upload-text">
                  {uploadState?.selectedFile?.status ? (
                    <div className={`${uploadState?.selectedFile?.status}`}>
                      {uploadState.selectedFile.name} -{" "}
                      {uploadState.selectedFile.status}
                    </div>
                  ) : (
                    "Click or drag file to this area to upload"
                  )}
                </p>
                <p className="ant-upload-hint">
                  Supported filetypes: .xls and .xlsx.
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
