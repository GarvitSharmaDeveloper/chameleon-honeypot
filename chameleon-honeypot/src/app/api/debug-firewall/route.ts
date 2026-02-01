import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || "ADMIN' OR '1'='1' --"

    // Construct the simulated "Attack URL" that the middleware would see
    // We force-inject the payload into the query string
    const simulatedUrl = `http://localhost:3000/api/prod?q=${encodeURIComponent(q)}`

    const rules = await redis.lrange('firewall:rules', 0, -1)
    const pendingLogs = await redis.lrange('attack:logs', 0, -1)


    const debugLog: string[] = []
    const log = (msg: string) => debugLog.push(msg)

    log(`Testing Payload: ${q}`)
    log(`Simulated Attack URL: ${simulatedUrl}`)
    log(`Rules Found: ${rules.length}`)

    let blocked = false
    const decodedUrl = decodeURIComponent(simulatedUrl)
    log(`Decoded URL to Test: ${decodedUrl}`)

    for (const ruleStr of rules) {
        try {
            log(`--- Checking Rule: ${ruleStr} ---`)
            // Regex parsing same as middleware
            const match = ruleStr.match(/^\/(.*?)\/([a-z]*)$/)
            let regex
            if (match) {
                log(`Parsed Pattern: ${match[1]}`)
                log(`Parsed Flags: ${match[2]}`)
                regex = new RegExp(match[1], match[2])
            } else {
                log(`Using Literal Pattern`)
                regex = new RegExp(ruleStr, 'i')
            }

            const isMatch = regex.test(decodedUrl)
            log(`Result: ${isMatch ? 'MATCHED (BLOCKED)' : 'No Match'}`)

            if (isMatch) blocked = true

        } catch (e: any) {
            log(`Error parsing rule: ${e.message}`)
        }
    }

    return NextResponse.json({
        blocked,
        rulesCount: rules.length,
        pendingLogsCount: pendingLogs.length,
        latestLog: pendingLogs[0] || 'None',
        rules,
        pendingLogs: pendingLogs.map(s => JSON.parse(s)), // Parse internal strings for readability
        logs: debugLog
    }, { status: 200 })
}
