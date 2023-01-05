import React from 'react';
import './webform.scss';
import { Webform } from 'akvo-react-form';
import 'akvo-react-form/dist/index.css';
import { UIState } from '../../state/ui';
import WebformLogin from './WebformLogin';
import { Row, Col } from 'antd';

const exForm = {
  id: 571070071,
  name: 'Water System',
  version: 1,
  description: null,
  languages: null,
  translations: null,
  question_group: [
    {
      id: 24,
      form: 571070071,
      question: [
        {
          id: 563210188,
          form: 571070071,
          question_group: 24,
          name: 'Name of Village',
          order: 3,
          meta: true,
          type: 'text',
          required: true,
          rule: null,
          dependency: null,
          tooltip: null,
          translations: null,
          api: null,
          option: [],
        },
      ],
      name: 'Location Demographics',
      order: 1,
      description: null,
      repeatable: null,
      translations: null,
      repeatText: null,
    },
  ],
};

const WebformStandalone = () => {
  const { isLogin, submitter } = UIState.useState((s) => s.webformLogin);
  console.info(submitter);

  if (!isLogin) {
    return <WebformLogin />;
  }

  return (
    <div className="webform-standalone-container">
      <Row>
        <Col
          span={24}
          className="webform"
        >
          <Webform
            forms={exForm}
            // onFinish={onFinish}
            // onChange={onChange}
            sticky={true}
          />
        </Col>
      </Row>
    </div>
  );
};

export default WebformStandalone;
