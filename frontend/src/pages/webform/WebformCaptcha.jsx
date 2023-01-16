import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Typography, Space, InputNumber, Button, Result } from 'antd';

const { Text } = Typography;

const CaptchaNumber = ({ validateCaptcha, setValidateCaptcha }) => {
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaInputValue, setCaptchaInputValue] = useState(false);

  useEffect(() => {
    const captchaNumber = document.getElementById('captcha-number');
    if (captchaNumber && captchaNumber.childNodes[0]) {
      captchaNumber.removeChild(captchaNumber.childNodes[0]);
    }
    if (captchaNumber) {
      const validatorX = Math.floor(Math.random() * 9) + 1;
      const validatorY = Math.floor(Math.random() * 9) + 1;
      const canv = document.createElement('canvas');
      canv.width = 200;
      canv.height = 50;
      const ctx = canv.getContext('2d');
      ctx.font = '35px Assistant, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeText(validatorX + '+' + validatorY, 100, 38);
      setCaptchaValue(validatorX + validatorY);
      captchaNumber.appendChild(canv);
    }
  }, [setCaptchaValue]);

  const onChangeCaptchaInput = (value) => {
    setCaptchaInputValue(value);
    if (setValidateCaptcha) {
      setValidateCaptcha(value === captchaValue);
    }
  };

  const captchaError = useMemo(() => {
    return !validateCaptcha && captchaInputValue !== false ? (
      <Text type="danger">Please enter correct value</Text>
    ) : (
      ''
    );
  }, [validateCaptcha, captchaInputValue]);

  return (
    <Space
      align="center"
      direction="vertical"
      className="captcha-container"
    >
      <h2>You&apos;re going to submit the form.</h2>
      <div className="captcha-box">
        <div id="captcha-number"></div>
        <>
          <Space
            align="start"
            direction="vertical"
            size={5}
          >
            <InputNumber
              placeholder="Enter the sum"
              min={1}
              max={100}
              size="large"
              autoFocus={true}
              value={captchaInputValue}
              onChange={onChangeCaptchaInput}
              style={{ width: '100%' }}
            />
            {captchaError}
          </Space>
        </>
      </div>
    </Space>
  );
};

const WebformCaptcha = ({ isVisible, onOk, onCancel, submitting }) => {
  const [validateCaptcha, setValidateCaptcha] = useState(false);

  const props = {
    icon: (
      <CaptchaNumber
        validateCaptcha={validateCaptcha}
        setValidateCaptcha={setValidateCaptcha}
      />
    ),
    title: '',
    extra: (
      <Space>
        <Button
          size="large"
          disabled={!validateCaptcha}
          onClick={onOk}
          type="primary"
          loading={submitting}
        >
          Submit
        </Button>
        <Button
          size="large"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Space>
    ),
  };

  return (
    <Modal
      visible={isVisible}
      title={null}
      footer={null}
      centered={true}
      zIndex={9999}
      closable={false}
      width={'520px'}
      destroyOnClose={true}
    >
      <Result {...props} />
    </Modal>
  );
};

export default WebformCaptcha;
