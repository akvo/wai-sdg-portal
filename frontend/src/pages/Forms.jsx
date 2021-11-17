import React, { useEffect, useState } from "react";
import { Webform } from "akvo-react-form";
import { Row, Col, Affix, notification, Progress } from "antd";
import startCase from "lodash/startCase";
import api from "../util/api";
import { useHistory } from "react-router-dom";

const Forms = ({ match }) => {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [percentage, setPercentage] = useState(0);

  const onFinish = (values) => {
    let data = Object.keys(values).map((v) => {
      if (values[v]) {
        return { question: parseInt(v), value: values[v] };
      }
      return false;
    });
    data = data.filter((x) => x);
    api
      .post(`data/form/${match.params.id}`, data)
      .then((res) => {
        setLoading(true);
        notification.success({
          message: `Data ID: ${res.data.id} - ${res.data.name} Saved`,
        });
        setTimeout(() => {
          history.goBack();
        }, 3000);
      })
      .catch((err) => {
        console.log(err);
        notification.success({
          message: "Ops, something went wrong",
        });
      });
  };

  const onChange = ({ progress }) => {
    setPercentage(progress.toFixed(0));
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
  }, [match, loading]);

  if (loading) {
    return "";
  }
  if (!match?.params?.title || !match?.params?.id) {
    return "";
  }

  return (
    <Row>
      <Affix style={{ width: "100%", zIndex: 1001 }}>
        <div style={{ padding: 20, width: "100%", background: "#fafafa" }}>
          <Progress percent={percentage} />
        </div>
      </Affix>
      <Col span={24} className="webform">
        <Col span={24} className="blue-header"></Col>
        <Row justify="center">
          <Col span={22}>
            <h1>{startCase(match.params.title)}</h1>
          </Col>
        </Row>
        <Row justify="center">
          <Col span={22} className="form-container">
            <Webform forms={forms} onFinish={onFinish} onChange={onChange} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Forms;
