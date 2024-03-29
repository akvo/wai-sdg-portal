import React, { useEffect, useState } from 'react';
import { Row, Col, Modal, Avatar, Checkbox, Input, Space, Button } from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { submitText, deleteText, saveText, deleteUserText } =
  window.i18n.confirmationModalText;

const modalProps = (type, secureDelete, setSecureDelete) => {
  switch (type) {
    case 'submit':
      return {
        icon: <UploadOutlined />,
        title: submitText?.title,
        subTitle: submitText?.subTitle,
        btnOkText: submitText?.btnOkText,
      };
    case 'delete-user':
      return {
        icon: <DeleteOutlined />,
        title: deleteUserText?.title,
        subTitle: deleteUserText?.subTitle,
        btnOkText: deleteUserText?.btnOkText,
      };
    case 'delete':
      return {
        icon: <DeleteOutlined />,
        title: deleteText?.title,
        subTitle: deleteText?.subTitle,
        secure: (
          <>
            <Space direction="vertical">
              <div>
                {deleteText?.deleteInputTitle?.map((x, xi) =>
                  xi === 1 ? (
                    <b key={`delete-input-title-${xi}`}>{` ${x} `}</b>
                  ) : (
                    x
                  )
                )}
                <Input
                  value={secureDelete.text}
                  onChange={(e) =>
                    setSecureDelete({ ...secureDelete, text: e.target.value })
                  }
                  style={{
                    borderColor:
                      secureDelete.text === 'DELETE' ? '#01770e' : '#9f0031',
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
                {deleteText?.checkboxText}
              </Checkbox>
            </Space>
          </>
        ),
        btnOkText: deleteText?.btnOkText,
      };
    default:
      return {
        icon: <SaveOutlined />,
        title: saveText?.title,
        subTitle: saveText?.subTitle,
        btnOkText: saveText?.btnOkText,
      };
  }
};

const defSecureDeleteState = {
  text: '',
  checked: false,
};

const ConfirmationModal = ({ visible, type, onOk, onCancel }) => {
  const [secureDelete, setSecureDelete] = useState(defSecureDeleteState);
  const modalProp = modalProps(type, secureDelete, setSecureDelete);
  const isSecure = secureDelete.text === 'DELETE' && secureDelete.checked;
  const disabledOkBtn = type === 'delete' ? !isSecure : false;

  useEffect(() => {
    setSecureDelete(defSecureDeleteState);
  }, [visible]);

  return (
    <Modal
      key="confirmation-modal"
      className="popup-notification"
      title=""
      visible={visible}
      centered={true}
      onCancel={onCancel}
      footer={[
        <Button
          key="confirm-ok"
          size="large"
          className={type.includes('delete') ? 'delete' : type}
          onClick={onOk}
          disabled={disabledOkBtn}
        >
          {modalProp?.btnOkText}
        </Button>,
      ]}
    >
      <Row
        align="middle"
        justify="center"
      >
        <Col
          span={24}
          align="center"
        >
          <Avatar
            className={type.includes('delete') ? 'delete' : type}
            icon={modalProp?.icon}
            alt={modalProp?.title}
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
          />
          <h2>{modalProp?.title}</h2>
          <p>{modalProp?.subTitle}</p>
          {modalProp?.secure ? modalProp.secure : ''}
        </Col>
      </Row>
    </Modal>
  );
};

export default ConfirmationModal;
