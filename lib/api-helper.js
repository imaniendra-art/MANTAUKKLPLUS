import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import connectDB from '@/lib/db';

/**
 * Wraps an API route handler to ensure the user is an admin and the DB is connected.
 * @param {Function} handler The route handler function (e.g. async (req, { params }, session) => {...})
 */
export function withAdminAuth(handler) {
  return async (req, context) => {
    try {
      const session = await getServerSession();
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      await connectDB();

      return await handler(req, context, session);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  };
}
