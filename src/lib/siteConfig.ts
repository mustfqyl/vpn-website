/**
 * Central site configuration.
 * Values are read from environment variables with sensible defaults.
 * 
 * For client-side usage, variables must be prefixed with NEXT_PUBLIC_.
 */

export const siteConfig = {
    /** Display name of the site (e.g. "SECUREVPN") */
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'SECUREVPN',

    /** Contact / support email shown on the contact page */
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@securevpn.com',

    /** Maximum number of devices a user can register */
    maxDevicesPerUser: parseInt(process.env.MAX_DEVICES_PER_USER || '3', 10),
} as const;
