import React, { useState, useEffect } from "react";
import { Row, Col, Space, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import takeRight from "lodash/takeRight";
import { UIState } from "../../state/ui";
import { SelectLevel, DropdownNavigation } from "../../components/common";
import { getLocationName } from "../../util/utils";

const { Dragger } = Upload;

const draggerProps = {
  multiple: false,
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  accept:
    "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const ManageUpload = () => {
  const { administration, selectedAdministration } = UIState.useState((s) => s);
  const [form, setForm] = useState("water");
  const [administrationName, setAdministrationName] = useState(null);

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
    if (selectedAdministration.length > 1) {
      const adminId = takeRight(selectedAdministration)[0];
      setAdministrationName(getLocationName(adminId, administration));
    }
  }, [selectedAdministration, administration]);

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
            <Dragger
              name={form}
              onChange={onChange}
              onDrop={onDrop}
              {...draggerProps}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
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
