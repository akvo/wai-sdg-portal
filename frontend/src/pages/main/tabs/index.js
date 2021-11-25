import TabJMP from "./TabJMP";

const TabContent = ({ loading, show, current, question, self }) => {
  const { component, chartList } = self;
  const { formId } = current;
  switch (component) {
    case "JMP-CHARTS":
      return (
        <TabJMP
          show={show}
          formId={formId}
          chartList={chartList}
          loading={loading}
          question={question}
        />
      );
    case "CLTS-PROGRESS-CHARTS":
      return <div>CLTS PROGRESS CHARTS</div>;
    default:
      return "";
  }
};

export default TabContent;
