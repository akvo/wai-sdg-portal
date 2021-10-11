import { Layout, Divider } from "antd";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Content from "./components/Content";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Navigation />
      <Layout theme="light">
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.Content>
          <Content />
        </Layout.Content>
        <Layout.Footer>
          <Footer />
        </Layout.Footer>
      </Layout>
    </div>
  );
}

export default App;
