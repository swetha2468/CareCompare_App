/**
 * Basic client-side JWT token utilities
 * Note: These do NOT verify signatures, just parse the payload
 */

/**
 * Check if a token exists and has a basic JWT format
 * @returns {boolean} True if the token looks valid
 */
export const hasToken = () => {
    const token = localStorage.getItem('token');
    return !!token && token.split('.').length === 3;
};

/**
 * Get the decoded payload from a JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const getTokenPayload = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to parse token:', e);
        return null;
    }
};

/**
 * Check if the token is expired based on its exp claim
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = () => {
    try {
        const payload = getTokenPayload();
        if (!payload || !payload.exp) return true;

        const expTimestamp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= expTimestamp;
    } catch (e) {
        return true;
    }
};

/**
 * Get estimated time until token expiration in seconds
 * @returns {number} Seconds until expiration (negative if expired)
 */
export const getSecondsUntilExpiration = () => {
    try {
        const payload = getTokenPayload();
        if (!payload || !payload.exp) return -1;

        const expTimestamp = payload.exp * 1000; // Convert to milliseconds
        return Math.floor((expTimestamp - Date.now()) / 1000);
    } catch (e) {
        return -1;
    }
};

/**
 * Should we attempt to refresh the token?
 * @param {number} thresholdSeconds Time threshold in seconds 
 * @returns {boolean} True if token should be refreshed
 */
export const shouldRefreshToken = (thresholdSeconds = 300) => {
    const secondsLeft = getSecondsUntilExpiration();
    return secondsLeft > 0 && secondsLeft < thresholdSeconds;
}; 