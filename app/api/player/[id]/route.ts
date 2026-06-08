import { getPlayerDetail } from '@/lib/nhl-api'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const player = await getPlayerDetail(parseInt(id))
  return NextResponse.json(player)
}
