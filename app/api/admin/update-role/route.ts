import { NextResponse } from 'next/server'
import { createClient as createRequestClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { ADMIN_ASSIGNABLE_ROLES, ALL_ROLES } from '../../../../lib/permissions'

export async function POST(request: Request) {
  const supabase = await createRequestClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: actorProfile, error: actorError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (actorError || !actorProfile) {
    return NextResponse.json({ error: 'Could not load your role.' }, { status: 400 })
  }

  const actorRole = actorProfile.role
  if (actorRole !== 'owner' && actorRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const targetUserId = body?.targetUserId
  const newRole = body?.newRole

  if (!targetUserId || !newRole) {
    return NextResponse.json({ error: 'Missing target user or role.' }, { status: 400 })
  }

  if (!ALL_ROLES.includes(newRole)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: 'You cannot change your own role here.' }, { status: 400 })
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('id, role, email')
    .eq('id', targetUserId)
    .single()

  if (targetError || !targetProfile) {
    return NextResponse.json({ error: 'Target user not found.' }, { status: 404 })
  }

  if (actorRole === 'admin') {
    if (targetProfile.role === 'owner' || targetProfile.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot change owners or other admins.' },
        { status: 403 }
      )
    }

    if (!ADMIN_ASSIGNABLE_ROLES.includes(newRole)) {
      return NextResponse.json(
        { error: 'Admins can only assign moderator, teacher, or member.' },
        { status: 403 }
      )
    }
  }

  try {
    const admin = createAdminClient()

    const { error: updateError } = await admin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Role update failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
