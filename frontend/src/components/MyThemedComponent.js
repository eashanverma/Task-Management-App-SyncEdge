import React from 'react';
import { useTheme } from './../App'; // Assuming App.js is in the same directory or adjust path

function MyThemedComponent() {
    const { themeMode, toggleTheme, enableLightTheme, enableDarkTheme, enableSystemTheme } = useTheme();

    return (
        <div>
            <p>Current Theme: {themeMode}</p>
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={enableLightTheme}>Light Theme</button>
            <button onClick={enableDarkTheme}>Dark Theme</button>
            <button onClick={enableSystemTheme}>System Theme</button>
            {/* Your component content */}
        </div>
    );
}

export default MyThemedComponent;