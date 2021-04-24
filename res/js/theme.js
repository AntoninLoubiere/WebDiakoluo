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
    const theme = localStorage.getItem('theme') || 'auto';
    document.firstElementChild.classList.add(
        theme === 'dark' || (theme === 'auto' && prefersDarkColorScheme()) ? 'theme-dark' : 'theme-light'  
    )
}

initialiseTheme();