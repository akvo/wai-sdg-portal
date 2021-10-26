import React, { useState, useEffect } from "react";
import { Row, Col, Space, Upload, message } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import takeRight from "lodash/takeRight";
import snakeCase from "lodash/snakeCase";
import { UIState } from "../../state/ui";
import { SelectLevel, DropdownNavigation } from "../../components/common";
import { getLocationName } from "../../util/utils";
import config from "./admin-static";
import moment from "moment";

const { Dragger } = Upload;
const allowedFiles = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

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

  return (
    <>
      <div className="filter-wrapper">
        <Space size={20} align="center" wrap={true}>
          <DropdownNavigation value={form} onChange={setForm} />
          <SelectLevel />
        </Space>
      </div>
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
    </>
  );
};

export default ManageUpload;
