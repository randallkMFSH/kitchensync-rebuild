import React, { useEffect, useState } from "react";
import "./ColorSchemeToggle.css";

export const ColorSchemeToggle = () => {
    const modeStorage = localStorage.getItem("isDarkMode");
    const defaultState =
        (modeStorage && modeStorage === "true") ?? window.matchMedia("(prefers-color-scheme: dark)").matches;

    const [isDarkMode, setIsDarkMode] = useState(defaultState);

    useEffect(() => {
        document.body.dataset.theme = isDarkMode ? "dark" : "light";
    }, [isDarkMode]);

    function toggleColorScheme() {
        const newIsDark = !isDarkMode;
        setIsDarkMode(newIsDark);
        localStorage.setItem("isDarkMode", newIsDark.toString());
    }

    return (
        <button
            className="colorSchemeToggle"
            onClick={toggleColorScheme}
            title={
                isDarkMode
                    ? "currently dark mode, press to switch to light mode"
                    : "currently light mode, press to switch to dark mode"
            }>
            {isDarkMode ? "🌘" : "☀"}
        </button>
    );
};
