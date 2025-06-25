import React from "react";

const MainContainer = ({ children, maxWidth = 500 }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 32px #0002",
        padding: "32px 20px",
        margin: "32px 0",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {children}
    </div>
  </div>
);

export default MainContainer;