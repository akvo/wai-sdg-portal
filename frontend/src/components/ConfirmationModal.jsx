import React, { useEffect, useState } from "react";
import { Row, Col, Modal, Avatar, Checkbox, Input, Space, Button } from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const modalProps = (type, secureDelete, setSecureDelete) => {
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
          "This changes are irreversible, this will permanently delete the data and it's history as well.",
        secure: (
          <>
            <Space direction="vertical">
              <div>
                Please type <b>DELETE</b> to confirm
                <Input
                  value={secureDelete.text}
                  onChange={(e) =>
                    setSecureDelete({ ...secureDelete, text: e.target.value })
                  }
                  style={{
                    borderColor:
                      secureDelete.text === "DELETE" ? "#01770e" : "#9f0031",
                  }}
                />
              </div>
              <Checkbox
                checked={secureDelete.checked}
                onChange={(e) =>
                  setSecureDelete({
                    ...secureDelete,
                    checked: e.target.checked,
                  })
                }
              >
                I understand the consequences.
              </Checkbox>
            </Space>
          </>
        ),
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

const defSecureDeleteState = {
  text: "",
  checked: false,
};

const ConfirmationModal = ({ visible, type, onOk, onCancel }) => {
  const [secureDelete, setSecureDelete] = useState(defSecureDeleteState);
  const modalProp = modalProps(type, secureDelete, setSecureDelete);
  const isSecure = secureDelete.text === "DELETE" && secureDelete.checked;
  const disabledOkBtn = type === "delete" ? !isSecure : false;

  useEffect(() => {
    setSecureDelete(defSecureDeleteState);
  }, [visible]);

  return (
    <Modal
      className="popup-notification"
      title="Basic Modal"
      visible={visible}
      centered={true}
      onCancel={onCancel}
      footer={[
        <Button
          key="confirm-ok"
          size="large"
          className={type}
          onClick={onOk}
          disabled={disabledOkBtn}
        >
          {modalProp?.btnOkText}
        </Button>,
      ]}
    >
      <Row align="middle" justify="center">
        <Col span={24} align="center">
          <Avatar
            className={type}
            icon={modalProp?.icon}
            alt={modalProp?.title}
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
          />
          <h2>{modalProp?.title}</h2>
          <p>{modalProp?.subTitle}</p>
          {modalProp?.secure ? modalProp.secure : ""}
        </Col>
      </Row>
    </Modal>
  );
};

export default ConfirmationModal;
