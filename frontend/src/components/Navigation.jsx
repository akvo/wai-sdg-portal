import React from "react";
import { Drawer } from "antd";
import { UIState } from "../state/ui";

const Navigation = () => {
  const visible = UIState.useState((s) => s.showNav);
  const onClose = () => {
    UIState.update((s) => {
      s.showNav = false;
    });
  };
  return (
    <>
      <Drawer
        title="Basic Drawer"
        placement="right"
        onClose={onClose}
        visible={visible}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};

export default Navigation;
