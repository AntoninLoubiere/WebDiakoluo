/**
 * Get if prefers dark color scheme.
 * @returns {boolean} if prefers dark color scheme
 */
function prefersDarkColorScheme() {
    return matchMedia?.('(prefers-color-scheme: dark)').matches;
}

/**
 * Initialise the theme depending of the settings.
 */
function initialiseTheme() {
    const theme = getSelectedTheme();
    document.firstElementChild.classList.add(
        theme === 'dark' || (theme === 'auto' && prefersDarkColorScheme()) ? 'theme-dark' : 'theme-light'  
    )
}

/**
 * Get the selected theme
 * @returns {string} the selected theme
 */
 function getSelectedTheme() {
    return localStorage.getItem('theme') || 'auto';
}

/**
 * Set the selected theme
 * @param {string} theme the selected theme
 */
 function setSelectedTheme(theme) {
    localStorage.setItem('theme', theme);

    document.firstElementChild.classList.remove('theme-dark');
    document.firstElementChild.classList.remove('theme-light');
    document.firstElementChild.classList.add(
        theme === 'dark' || (theme === 'auto' && prefersDarkColorScheme()) ? 'theme-dark' : 'theme-light'  
    )
}

initialiseTheme();