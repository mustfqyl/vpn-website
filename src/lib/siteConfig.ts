/**
 * Central site configuration.
 * Values are read from environment variables with sensible defaults.
 * 
 * For client-side usage, variables must be prefixed with NEXT_PUBLIC_.
 */

export const siteConfig = {
    /** Display name of the site */
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Oculve',

    /** Contact / support email shown on the contact page */
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@oculve.com',
} as const;
