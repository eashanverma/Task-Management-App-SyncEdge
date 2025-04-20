// src/components/ThemeSwitcher.js
import React from 'react';
import { useTheme } from '../App'; // Make sure the path is correct

const ThemeSwitcher = () => {
    const { themeMode, enableLightTheme, enableDarkTheme, enableSystemTheme } = useTheme();

    return (
        <div>
            <label>
                <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={themeMode === 'light'}
                    onChange={enableLightTheme}
                />
                Light
            </label>
            {/* ... other radio buttons ... */}
        </div>
    );
};

export default ThemeSwitcher;