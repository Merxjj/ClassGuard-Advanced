/**
 * Normalizes IP addresses for comparison.
 * Strips IPv6 prefixes and handles localhost.
 */
exports.normalizeIp = (ip) => {
    if (!ip) return '0.0.0.0';
    
    // Handle IPv6 literal for localhost
    if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
    
    // Strip the IPv4-mapped IPv6 prefix if present (::ffff:)
    if (ip.startsWith('::ffff:')) {
        return ip.substring(7);
    }
    
    return ip;
};
