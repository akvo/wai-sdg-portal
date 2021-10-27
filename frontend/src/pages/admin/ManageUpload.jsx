import React, { useState, useEffect } from "react";
import { Row, Col, Space, Upload, Button, message, notification } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import takeRight from "lodash/takeRight";
import snakeCase from "lodash/snakeCase";
import moment from "moment";
import { UIState } from "../../state/ui";
import { SelectLevel, DropdownNavigation } from "../../components/common";
import { getLocationName } from "../../util/utils";
import api from "../../util/api";
import config from "./admin-static";

const { Dragger } = Upload;
const allowedFiles = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const regExpFilename = /filename="(?<filename>.*)"/;

const ManageUpload = () => {
  const { user, administration, selectedAdministration } = UIState.useState(
    (s) => s
  );
  const [form, setForm] = useState("water");
  const [fileName, setFileName] = useState(null);
  const { formId } = config[form];

  const onChange = (info) => {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const onDrop = (e) => {
    console.log("Dropped files", e.dataTransfer.files);
  };

  useEffect(() => {
    if (user && selectedAdministration.length > 2) {
      const date = moment().format("YYYYMMDD");
      const adminId = takeRight(selectedAdministration)[0];
      const administrationName = snakeCase(
        getLocationName(adminId, administration)
      );
      setFileName(
        [date, formId, snakeCase(user.name), administrationName].join("-")
      );
    }
    if (selectedAdministration.length < 2) {
      setFileName(null);
    }
  }, [user, selectedAdministration, administration, formId]);

  const uploadProps = {
    name: fileName,
    multiple: false,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    accept: allowedFiles.join(","),
    onChange: onChange,
    onDrop: onDrop,
    disabled: fileName ? false : true,
  };

  const downloadTemplate = () => {
    api
      .get(`download/excel-template/${formId}`, { responseType: "blob" })
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
              <SelectLevel />
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
                  <FileExcelOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
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
