import React, { useState, useEffect } from "react";
import { Row, Col, List, Space, Button, Tag, Popover } from "antd";
import {
  FileExcelFilled,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import api from "../../util/api";
import { UIState } from "../../state/ui";
import upperFirst from "lodash/upperFirst";

const ItemDescription = ({ created, tags }) => {
  return (
    <Space direction="vertical">
      <div>{created}</div>
      {tags.length ? (
        <div>
          Filters:{" "}
          {tags.map((t, i) => (
            <Tag
              key={i}
              icon={
                <Popover title={upperFirst(t.q)} placement="topRight">
                  <InfoCircleOutlined />
                </Popover>
              }
            >
              {upperFirst(t.o)}
            </Tag>
          ))}
        </div>
      ) : null}
    </Space>
  );
};

const Export = () => {
  const [fileList, setFileList] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadMoreButton, setLoadMoreButton] = useState(true);
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
    if (pending && !refreshing && !pendingFile) {
      setRefreshing(true);
      setTimeout(() => {
        api.get(`download/status?id=${pending.id}`).then((res) => {
          if (res?.data?.status === "done") {
            setPendingFile(res.data);
            setRefreshing(false);
          }
        });
      }, 3000);
    }
  }, [refreshing, pendingFile, pending]);

  useEffect(() => {
    if (pendingFile) {
      const currentList = fileList.map((x) => {
        if (pendingFile.id === x.id) {
          return pendingFile;
        }
        return x;
      });
      setPendingFile(null);
      setFileList(currentList);
    }
  }, [pendingFile, fileList]);

  const handleDownload = (payload) => {
    api
      .get(`download/file/${payload}`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", payload);
        document.body.appendChild(link);
        link.click();
      });
  };

  const onLoadMore = () => {
    api
      .get(`download/list?page=${page + 1}`)
      .then((res) => {
        setFileList([...fileList, ...res.data]);
        setPage(page + 1);
      })
      .catch(() => {
        setLoadMoreButton(false);
      });
  };

  const loadMore =
    !loading && fileList.length ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          marginBottom: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        {loadMoreButton ? (
          <Button onClick={onLoadMore}>More</Button>
        ) : (
          "End of the list"
        )}
      </div>
    ) : null;

  return (
    <Row className="filter-wrapper" align="middle" justify="space-between">
      <Col span={24}>
        <List
          loading={loading}
          bordered={true}
          itemLayout="horizontal"
          loadMore={loadMore}
          dataSource={fileList}
          renderItem={(item) => {
            const filename = item?.payload?.replace("download/", "");
            const done = item?.status === "done";
            return (
              <List.Item key={item.id}>
                <List.Item.Meta
                  avatar={
                    <FileExcelFilled
                      style={{
                        color: done ? "#52c41a" : "#dddddd",
                        fontSize: "50px",
                      }}
                    />
                  }
                  title={<a href={item?.payload}>{filename}</a>}
                  description={
                    <ItemDescription created={item.created} {...item.info} />
                  }
                />
                <Button
                  onClick={() => handleDownload(item?.payload)}
                  icon={<DownloadOutlined />}
                  loading={!done}
                  disabled={!done}
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
