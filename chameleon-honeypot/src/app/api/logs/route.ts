import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
    try {
        // Fetch last 300 trapped attacks
        const trapped = await redis.lrange('attack:logs', 0, 299)
        // Fetch last 300 blocked attacks
        const blocked = await redis.lrange('firewall:logs', 0, 299)

        // Helper to safe parse
        const parse = (item: string) => {
            try { return typeof item === 'string' ? JSON.parse(item) : item }
            catch { return { command: item, timestamp: Date.now() } }
        }

        return NextResponse.json({
            trapped: trapped.map(parse),
            blocked: blocked.map(parse)
        })
    } catch (error) {
        return NextResponse.json({ trapped: [], blocked: [] })
    }
}
