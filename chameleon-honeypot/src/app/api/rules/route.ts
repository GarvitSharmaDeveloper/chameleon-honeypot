import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
    try {
        const rules = await redis.lrange('firewall:rules', 0, -1)
        return NextResponse.json({ rules })
    } catch (error) {
        return NextResponse.json({ rules: [] })
    }
}
