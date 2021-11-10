import React, { useState, useEffect } from "react";
import { Row, Col, List, Button } from "antd";
import { FileExcelFilled, DownloadOutlined } from "@ant-design/icons";
import api from "../../util/api";
import { UIState } from "../../state/ui";

const Export = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const { user } = UIState.useState((s) => s);
  useEffect(() => {
    if (user) {
      api
        .get("download/list")
        .then((res) => {
          setLoading(false);
          setFileList(res.data);
        })
        .catch(() => {
          setLoading(false);
          setFileList([]);
        });
    }
  }, [user]);

  const pending = fileList.find((item) => item.status !== "done");

  useEffect(() => {
    if (pending && attempt < 2) {
      setTimeout(() => {
        api
          .get("download/list")
          .then((res) => {
            setLoading(false);
            setFileList(res.data);
            setAttempt(attempt + 1);
          })
          .catch(() => {
            setLoading(false);
            setFileList([]);
            setAttempt(attempt + 1);
          });
      }, 10000);
    }
  }, [pending, attempt]);

  const handleDownload = (payload) => {
    api
      .get(`download/file/${payload}`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", payload); //or any other extension
        document.body.appendChild(link);
        link.click();
      });
  };

  return (
    <Row className="filter-wrapper" align="middle" justify="space-between">
      <Col span={24}>
        <List
          loading={loading}
          bordered={true}
          itemLayout="horizontal"
          dataSource={fileList}
          renderItem={(item) => {
            const filename = item?.payload?.replace("download/", "");
            return (
              <List.Item key={item.id}>
                <List.Item.Meta
                  avatar={
                    <FileExcelFilled
                      style={{ color: "#52c41a", fontSize: "50px" }}
                    />
                  }
                  title={<a href={item?.payload}>{filename}</a>}
                  description={item?.created}
                />
                <Button
                  onClick={() => handleDownload(item?.payload)}
                  icon={<DownloadOutlined />}
                  loading={item?.status !== "done"}
                  disabled={item?.status !== "done"}
                >
                  Download
                </Button>
              </List.Item>
            );
          }}
        />
      </Col>
    </Row>
  );
};

export default Export;
