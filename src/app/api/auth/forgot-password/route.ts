import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // We don't want to reveal if a user exists or not for security,
    // so we always return success even if user not found.
    if (!user) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Invalidate existing tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    });

    // TODO: Send email using Resend
    console.log(`[AUTH] Password Reset Token for ${email}: ${token}`);

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, a reset link has been sent.' 
    });

  } catch (error: any) {
    console.error('[Forgot Password Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';
