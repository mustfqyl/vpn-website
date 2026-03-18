/**
 * Safely extracts the client's IP address from the request headers.
 * Handles cases where the request is behind multiple proxies.
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    
    if (forwardedFor) {
        // x-forwarded-for can be a comma-separated list of IPs.
        // The first one is typically the original client's IP.
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        if (ips[0]) return ips[0];
    }
    
    // Fallback to a default if header is missing or empty
    return '127.0.0.1';
}
