import { NextRequest, NextResponse } from 'next/server';
import { NewsletterRepository } from '@/repositories/newsletter.repository';

export async function GET() {
  try {
    const subscribers = await NewsletterRepository.getSubscribers();
    const smtpConfig = await NewsletterRepository.getSmtpConfig();
    return NextResponse.json({ subscribers, smtpConfig });
  } catch (error) {
    console.error('Failed to get subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'delete_subscriber') {
      const success = await NewsletterRepository.deleteSubscriber(body.id);
      return NextResponse.json({ success });
    }

    if (action === 'save_smtp') {
      const updated = await NewsletterRepository.saveSmtpConfig(body.smtpConfig);
      return NextResponse.json({ success: true, smtpConfig: updated });
    }

    if (action === 'test_smtp') {
      if (body.smtpConfig) {
        await NewsletterRepository.saveSmtpConfig(body.smtpConfig);
      }
      const testResult = await NewsletterRepository.testSmtpConnection();
      return NextResponse.json(testResult);
    }

    if (action === 'send_broadcast') {
      const { subject, message } = body;
      if (!subject || !message) {
        return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
      }
      const result = await NewsletterRepository.sendBroadcast(subject, message);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Subscribers API error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
