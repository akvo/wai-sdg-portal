import React, { useState, useEffect } from "react";
import { Row, Col, List } from "antd";
import { FileExcelFilled, DownloadOutlined } from "@ant-design/icons";
import api from "../../util/api";
import { UIState } from "../../state/ui";

const Export = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
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
              </List.Item>
            );
          }}
        />
      </Col>
    </Row>
  );
};

export default Export;
