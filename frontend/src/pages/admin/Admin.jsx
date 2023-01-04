import React, { useEffect, useState } from 'react';
import { Row, Col, Tabs } from 'antd';
import { UIState } from '../../state/ui';
import api from '../../util/api';
import ManageData from './ManageData';
import ManageUser from './ManageUser';
import ManageUpload from './ManageUpload';
import ManageForm from './ManageForm';
import ManagePasscode from './ManagePasscode';
import Export from './Export';
import { useHistory } from 'react-router-dom';
import './admin.scss';

const { TabPane } = Tabs;
const { adminText } = window.i18n;
const { allowEdit, allowAddNew } = window.features.formFeature;

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
    tabManageFormText,
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
            className="admin-tabs-wrapper"
          >
            <TabPane
              tab={<div className="tab-pane-text">{tabManageDataText}</div>}
              key="manage-data"
            />
            <TabPane
              tab={<div className="tab-pane-text">{tabExportText}</div>}
              key="exports"
            />
            <TabPane
              tab={<div className="tab-pane-text">{tabDataUploadText}</div>}
              key="data-upload"
            />
            {user?.role === 'admin' && (
              <TabPane
                tab={<div className="tab-pane-text">{tabManageUserText}</div>}
                key="manage-users"
              />
            )}
            {user?.role === 'admin' && (allowEdit || allowAddNew) && (
              <TabPane
                tab={<div className="tab-pane-text">{tabManageFormText}</div>}
                key="manage-form"
              />
            )}
            <TabPane
              tab={<div className="tab-pane-text">Manage Form Passcode</div>}
              key="manage-passcode"
            />
          </Tabs>
        </div>
        <div className="card-content-container">
          {page === 'manage-data' && (
            <ManageData
              handleTabClick={handleTabClick}
              currentTab={<div className="tab-pane-text">{page}</div>}
            />
          )}
          {page === 'exports' && <Export />}
          {page === 'data-upload' && <ManageUpload />}
          {user?.role === 'admin' && page === 'manage-users' && <ManageUser />}
          {user?.role === 'admin' && page === 'manage-form' && <ManageForm />}
          {user?.role === 'admin' && page === 'manage-passcode' && (
            <ManagePasscode />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default Admin;
