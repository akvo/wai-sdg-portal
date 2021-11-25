import RowPieChartGroup from "./RowPieChartGroup";

const RowContent = ({ current, self }) => {
  const { component, chartList } = self;
  const { formId } = current;
  switch (component) {
    case "PIE-CHART-GROUP":
      return (
        <RowPieChartGroup
          formId={formId}
          configFormId={self?.formId}
          chartList={chartList}
        />
      );
    default:
      return "";
  }
};

export default RowContent;
