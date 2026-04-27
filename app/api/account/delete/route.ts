import { NextResponse } from 'next/server'
import { createClient as createRequestClient } from '../../../../lib/supabase/server'
import { createAdminClient } from '../../../../lib/supabase/admin'

export async function POST() {
  const supabase = await createRequestClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id, false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

