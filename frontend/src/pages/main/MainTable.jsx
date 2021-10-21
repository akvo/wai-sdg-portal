import { Row, Col, Button, Divider, Table, Pagination } from "antd";
import { Link } from "react-router-dom";
import MainTableChild from "./MainTableChild";

const MainTable = ({
  current,
  loading,
  data,
  questionGroup,
  total,
  changePage,
  setPerPage,
  lastSubmitted,
}) => {
  const { columns, formId, title } = current;
  return (
    <Col span={12} className="table-wrapper">
      <div className="container">
        <Row
          align="middle"
          justify="space-between"
          wrap={true}
          className="data-info"
        >
          <Col span={8}>
            <span className="info title">
              {title}
              {` (${total})`}
            </span>
          </Col>
          <Col span={16} align="end">
            {total ? (
              <div className="info">
                Last submitted: {lastSubmitted.at}
                <br />
                by: {lastSubmitted.by}
              </div>
            ) : (
              ""
            )}
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
                expandIconColumnIndex: columns.length,
                expandedRowRender: (record) => (
                  <MainTableChild questionGroup={questionGroup} data={record} />
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
                onShowSizeChange={(e, s) => {
                  setPerPage(s);
                }}
                pageSizeOptions={[10, 20, 50]}
                onChange={changePage}
              />
            ) : (
              ""
            )}
          </Col>
          <Col span={4}>
            <Link to={`/form/new-${title.toLowerCase()}/${formId}`}>
              <Button>Add New</Button>
            </Link>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default MainTable;
