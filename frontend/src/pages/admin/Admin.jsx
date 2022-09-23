import React, { useEffect, useState } from 'react';
import { Row, Col, Tabs } from 'antd';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import ManageData from './ManageData';
import ManageUser from './ManageUser';
import ManageUpload from './ManageUpload';
import Export from './Export';
import { useHistory } from 'react-router-dom';
import './admin.scss';

const { TabPane } = Tabs;
const { adminText } = window?.i18n;

api
  .get('/organisation')
  .then((res) => {
    UIState.update((s) => {
      s.organisations = res.data;
    });
  })
  .catch((err) => {
    console.error(err);
  });

const Admin = ({ match }) => {
  const {
    welcomeText,
    tabManageDataText,
    tabExportText,
    tabDataUploadText,
    tabManageUserText,
  } = adminText;
  const [page, setPage] = useState(match?.params?.page);
  const history = useHistory();
  const { user } = UIState.useState((e) => e);

  useEffect(() => {
    if (page) {
      UIState.update((e) => {
        e.selectedAdministration = [null];
      });
    }
  }, [page]);

  const handleTabClick = (key) => {
    setPage(key);
    history.push(`/admin/${key}`);
  };

  return (
    <Row className="admin-container">
      {/* Jumbotron */}
      <Col span={24}>
        <Row className="jumbotron-container">
          <Col
            span={24}
            className="container"
          >
            <h1>{welcomeText}</h1>
          </Col>
        </Row>
      </Col>
      {/* Content */}
      <Col
        span={24}
        className="container content-wrapper"
      >
        <div className="card-container">
          <Tabs
            type="card"
            size="large"
            tabBarGutter={0}
            activeKey={page}
            onTabClick={handleTabClick}
          >
            <TabPane
              tab={tabManageDataText}
              key="manage-data"
            >
              {page === 'manage-data' && (
                <ManageData
                  handleTabClick={handleTabClick}
                  currentTab={page}
                />
              )}
            </TabPane>
            <TabPane
              tab={tabExportText}
              key="exports"
            >
              {page === 'exports' && <Export />}
            </TabPane>
            <TabPane
              tab={tabDataUploadText}
              key="data-upload"
            >
              {page === 'data-upload' && <ManageUpload />}
            </TabPane>
            {user?.role === 'admin' && (
              <TabPane
                tab={tabManageUserText}
                key="manage-users"
              >
                {page === 'manage-users' && <ManageUser />}
              </TabPane>
            )}
          </Tabs>
        </div>
      </Col>
    </Row>
  );
};

export default Admin;
