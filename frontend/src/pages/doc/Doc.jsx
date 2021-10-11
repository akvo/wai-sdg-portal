import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./doc.scss";
import { UIState } from "../../state/ui";
import api from "../../util/api";

const Doc = () => {
  if (api?.token) {
    return (
      <SwaggerUI
        withCredentials={true}
        persistAuthorization={true}
        url="/api/openapi.json"
        onComplete={(ui) => {
          ui.preauthorizeApiKey("HTTPBearer", api.token);
        }}
      />
    );
  }
  return "";
};

export default Doc;
