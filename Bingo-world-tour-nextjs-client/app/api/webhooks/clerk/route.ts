import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      })
    }

    // Get the body
    const payload = await request.text()

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

    // Verify the payload with the headers
    let evt: {
      type: string
      data: {
        id: string
        email_addresses: Array<{ email_address: string }>
        first_name?: string
        last_name?: string
      }
    }

    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as typeof evt
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Error occured', {
        status: 400,
      })
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data

      // Create user in our database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          name: first_name ? `${first_name} ${last_name || ''}`.trim() : null,
          isAdmin: false // Default to non-admin
        }
      })

      console.log('User created:', id)
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data

      // Update user in our database
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: email_addresses[0]?.email_address || '',
          name: first_name ? `${first_name} ${last_name || ''}`.trim() : null,
        },
        create: {
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          name: first_name ? `${first_name} ${last_name || ''}`.trim() : null,
          isAdmin: false
        }
      })

      console.log('User updated:', id)
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      // Delete user from our database
      await prisma.user.delete({
        where: { clerkId: id }
      })

      console.log('User deleted:', id)
    }

    return NextResponse.json({ message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
