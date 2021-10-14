import React, { useEffect, useState } from "react";
import { Webform } from "akvo-react-form";
import api from "../util/api";
import { Row, Col, Card } from "antd";
import startCase from "lodash/startCase";

const Forms = ({ match }) => {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);

  const onFinish = (d) => {
    console.log("onfinish");
  };

  useEffect(() => {
    (async function () {
      if (match?.params?.id && loading) {
        api.get(`webform/${match.params.id}`).then((x) => {
          setForms(x.data);
          setLoading(false);
        });
      }
    })();
  }, [match]);

  if (loading) {
    return "";
  }
  if (!match?.params?.title || !match?.params?.id) {
    return "";
  }

  return (
    <Row>
      <Col span={24} className="webform">
        <Col span={24} className="blue-header"></Col>
        <Row justify="center">
          <Col span={22}>
            <h1>{startCase(match.params.title)}</h1>
          </Col>
        </Row>
        <Row justify="center">
          <Col span={22} className="form-container">
            <Webform forms={forms} onFinish={onFinish} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Forms;
