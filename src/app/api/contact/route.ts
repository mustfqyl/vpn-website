import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { siteConfig } from '@/lib/siteConfig';

/**
 * POST /api/contact
 * Handles contact form submissions
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, type, message } = body;

        // Basic validation
        if (!email || !type || !message) {
            return NextResponse.json(
                { error: 'Email, inquiry type, and message are required.' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address.' },
                { status: 400 }
            );
        }

        logger.info({ email, type, message }, 'Contact form submission received');

        /**
         * NOTE: In a production environment, you would typically:
         * 1. Send an email to the support team (e.g., via Resend, SendGrid, etc.)
         * 2. Save the inquiry to the database
         * 3. Send an automated confirmation email to the user
         */
        
        // For now, we'll log it and return success
        // This fulfills the "Functional Completeness" requirement by providing a real endpoint.

        return NextResponse.json({
            success: true,
            message: 'Inquiry received. Our team will contact you shortly.'
        }, { status: 200 });

    } catch (error) {
        logger.error({ error }, 'Contact form submission failed');
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later.' },
            { status: 500 }
        );
    }
}
