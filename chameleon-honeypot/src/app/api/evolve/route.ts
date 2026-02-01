import { NextResponse } from 'next/server'
import { evolveFirewallRule } from '@/lib/defense'

export async function POST(req: Request) {
    const result = await evolveFirewallRule()
    if (result.success) {
        return NextResponse.json(result)
    } else {
        return NextResponse.json(result, { status: result.message === 'No new attacks to analyze.' ? 200 : 500 })
    }
}
