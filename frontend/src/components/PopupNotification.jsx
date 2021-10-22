import React from "react";
import { Row, Col, Modal, Avatar } from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

/*
!! How to use
<Button onClick={() => PopupNotification(handleOkFn, "save")}>
  Popup Test
</Button>
*/

const { info } = Modal;

const modalProps = (type) => {
  switch (type) {
    case "submit":
      return {
        icon: <UploadOutlined />,
        title: "Submit Entry?",
        subTitle: "Are you sure you want to submit this entry?",
        btnOkText: "Yes, Submit This Entry",
      };
    case "delete":
      return {
        icon: <DeleteOutlined />,
        title: "Delete Entry?",
        subTitle:
          "Are you sure you want to delete this entry, this Will delete the history as well",
        btnOkText: "Yes, Delete This Entry",
      };
    default:
      return {
        icon: <SaveOutlined />,
        title: "Save Entry?",
        subTitle: "You can come back at any time to complete and submit",
        btnOkText: "Yes, Save This Entry",
      };
  }
};

const PopupNotification = (handleOk, type = null) => {
  const props = modalProps(type);

  return info({
    className: "popup-notification",
    closable: true,
    centered: true,
    content: (
      <Row align="middle" justify="center">
        <Col span={24} align="center">
          <Avatar
            className={type}
            icon={props?.icon}
            alt={props?.title}
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
          />
          <h2>{props?.title}</h2>
          <p>{props?.subTitle}</p>
        </Col>
      </Row>
    ),
    okButtonProps: {
      size: "large",
      className: type,
    },
    okText: props?.btnOkText,
    onOk() {
      return handleOk();
    },
  });
};

export default PopupNotification;
