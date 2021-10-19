import { Row, Col, Button, Divider, Table, Pagination } from "antd";
import { Link } from "react-router-dom";
import MainTableChild from "./MainTableChild";

const MainTable = ({ loading, data, columns, question, total, changePage }) => {
  return (
    <Col span={12} className="table-wrapper">
      <div className="container">
        <Row align="middle" justify="space-between" wrap={true}>
          <Col span={8}>
            <span className="title">
              Water Points: {"("}
              {total}
              {")"}
            </span>
          </Col>
          <Col span={12} align="end">
            <span className="info">Last submitted 18.00 by User</span>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={24}>
            <Table
              size="small"
              loading={loading}
              columns={columns}
              scroll={{ y: 320 }}
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <MainTableChild question={question} data={record} />
                ),
              }}
              dataSource={data}
            />
          </Col>
        </Row>
        <Divider />
        <Row align="middle" justify="space-between" wrap={true}>
          <Col span={20}>
            {total ? (
              <Pagination
                defaultCurrent={1}
                total={total}
                onChange={changePage}
              />
            ) : (
              ""
            )}
          </Col>
          <Col span={4}>
            <Link to="/form/water-point-data-upload/5">
              <Button>Add New</Button>
            </Link>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default MainTable;
