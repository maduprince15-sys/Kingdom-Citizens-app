import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { canModeratePosts } from '../../../../lib/permissions'

export async function POST(request: Request) {
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
    return NextResponse.json({ error: 'Could not load role.' }, { status: 400 })
  }

  const body = await request.json()
  const id = body?.id

  if (!id) {
    return NextResponse.json({ error: 'Missing announcement id.' }, { status: 400 })
  }

  const { data: announcement, error: loadError } = await supabase
    .from('app_announcements')
    .select('id, author_id')
    .eq('id', id)
    .single()

  if (loadError || !announcement) {
    return NextResponse.json({ error: 'Announcement not found.' }, { status: 404 })
  }

  const canDelete = canModeratePosts(profile.role) || announcement.author_id === user.id

  if (!canDelete) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('app_announcements')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
