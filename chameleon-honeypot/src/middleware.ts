import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/honeypot (We want the attacker to reach the honeypot)
         * - api/evolve (Internal admin route)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/honeypot|api/evolve|_next/static|_next/image|favicon.ico).*)',
    ],
}

export async function middleware(request: NextRequest) {
    // 1. Skip if it's a static file or specifically allowed (handled by matcher mostly, but good to be safe)
    if (request.nextUrl.pathname.startsWith('/_next')) return NextResponse.next()

    try {
        const url = request.url

        // Filter out noise
        if (url.includes('/api/rules') || url.includes('favicon.ico')) return NextResponse.next()

        // Decode URL components AND replace '+' with spaces (common WAF bypass issue)
        const decodedUrl = decodeURIComponent(url).replace(/\+/g, ' ')
        console.log("🔥 Middleware Inspecting:", url)
        console.log("🔥 Decoded URL:", decodedUrl)


        // --- PHASE 2: SMART ROUTING (The "Dual Reality") ---
        // 1.5 Check for Suspicious Login Attempts
        if (url.includes('/login')) {
            // Heuristic: If they have "?ref=malicious" or come from a suspicious User-Agent (simulated)
            // For the DEMO, we'll route anyone with ?suspicious=true to the trap
            if (url.includes('suspicious=true') || url.includes('bot')) {
                console.log(`🔀 Smart Routing: Redirecting suspicious user to /login-trap`)
                return NextResponse.rewrite(new URL('/login-trap', request.url))
            }
        }

        // 1.7 Check for Honey Tokens (Stolen Credentials from Honeypot)
        // If query parameters contain our specific fake password hash, IT'S A TRAP!
        if (decodedUrl.includes('7c4a8d09ca3762af61e59520943dc26494f8941b')) {
            console.log(`🔀 TRAP: Stolen Credential Usage Detected!`)
            return new NextResponse(
                JSON.stringify({
                    error: 'ACCOUNT COMPROMISED: Stolen Credentials Detected.',
                    detail: 'This account was flagged as a Honeypot User. Your IP has been logged.'
                }),
                { status: 403, headers: { 'content-type': 'application/json' } }
            )
        }

        // 2. Fetch Active Rules from Redis
        const rules = await redis.lrange('firewall:rules', 0, -1)
        console.log("🔥 Rules fetched:", rules)

        if (rules.length > 0) {
            for (const ruleStr of rules) {
                try {
                    // DEMO: The agent outputs a full regex string like "/abc/i"
                    const match = ruleStr.match(/^\/(.*?)\/([a-z]*)$/)
                    let regex
                    if (match) {
                        console.log(`🔥 Parsing Regex: Pattern='${match[1]}' Flags='${match[2]}'`)
                        regex = new RegExp(match[1], match[2])
                    } else {
                        regex = new RegExp(ruleStr, 'i')
                    }

                    const isMatch = regex.test(decodedUrl)
                    console.log(`🔥 Testing Rule: ${ruleStr} -> Match? ${isMatch}`)

                    if (isMatch) {
                        console.log(`[BLOCKED] Request matched rule: ${ruleStr}`)
                        return new NextResponse(
                            JSON.stringify({ error: 'Blocked by Chameleon Firewall', rule: ruleStr }),
                            { status: 403, headers: { 'content-type': 'application/json' } }
                        )
                    }
                } catch (e) {
                    console.error('Invalid Regex in Redis:', ruleStr, e)
                }
            }
        }
    } catch (error) {
        console.error('Middleware Error:', error)
    }

    return NextResponse.next()
}
