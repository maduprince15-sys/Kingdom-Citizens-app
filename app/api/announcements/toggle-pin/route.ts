import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'
import { canModeratePosts } from '../../../../lib/permissions'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'owner' && !canModeratePosts(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { announcementId, isPinned } = body

    if (!announcementId || typeof isPinned !== 'boolean') {
      return NextResponse.json(
        { error: 'announcementId and isPinned are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { error: updateError } = await admin
      .from('app_announcements')
      .update({
        is_pinned: isPinned,
        pinned_at: isPinned ? new Date().toISOString() : null,
      })
      .eq('id', announcementId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle announcement pin error:', error)
    return NextResponse.json(
      { error: 'Something went wrong while updating the announcement pin.' },
      { status: 500 }
    )
  }
}