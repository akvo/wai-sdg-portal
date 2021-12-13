import React, { useEffect, useState } from "react";
import { Webform } from "akvo-react-form";
import "akvo-react-form/dist/index.css";
import { Row, Col, Affix, notification, Progress } from "antd";
import api from "../util/api";
import { useHistory } from "react-router-dom";

const { notificationText } = window?.i18n;

const Forms = ({ match }) => {
  let history = useHistory();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [offset, setOffset] = useState(0);
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
          message: notificationText?.formPostDataSuccessText.replace(
            "##content##",
            `${res.data.id} - ${res.data.name}`
          ),
        });
        setTimeout(() => {
          history.goBack();
        }, 3000);
      })
      .catch((err) => {
        notification.error({
          message: notificationText?.errorText,
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

  useEffect(() => {
    window.onscroll = () => {
      setOffset(window.pageYOffset);
    };
  }, []);

  if (loading) {
    return "";
  }
  if (!match?.params?.title || !match?.params?.id) {
    return "";
  }

  return (
    <Row>
      <Affix style={{ width: "100%", zIndex: 1002 }}>
        <div className="webform-progress-bar">
          <Progress percent={percentage} />
        </div>
      </Affix>
      <Col span={24} className="webform">
        <Col
          span={24}
          className={offset > 66 ? "blue-header to-white" : "blue-header"}
        ></Col>
        <Row justify="center">
          <Col span={22} className="form-container">
            <Webform
              forms={forms}
              onFinish={onFinish}
              onChange={onChange}
              sticky={true}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Forms;
