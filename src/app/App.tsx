import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"auth" | "home">("auth");

  return (
    <>
      {currentScreen === "auth" ? (
        <AuthPage onLogin={() => setCurrentScreen("home")} />
      ) : (
        <HomePage />
      )}
    </>
  );
}