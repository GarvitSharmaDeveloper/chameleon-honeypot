import { GoogleGenerativeAI } from '@google/generative-ai'
import { redis } from '@/lib/redis'

const USE_MOCK = false // Real API Enabled

// Initialize Gemini
const getGeminiModel = () => {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
    return genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
}

const EVOLVE_SYSTEM_PROMPT = `
You are an expert Security Engineer.
Your goal is to write a Javascript Regular Expression that blocks the provided malicious input.
You must be precise. Avoid overly broad rules like /.*/.
Capture the specific syntax of the attack (e.g. usage of UNION SELECT, OR 1=1, <script>).
Handle optional quotes around values (e.g. '1'='1' or "1"="1"). Ensure closing quotes are matched.
Respond ONLY with the Regex string (e.g. /union\s+select/i).
`

export async function evolveFirewallRule(specificLogStr?: string): Promise<{ success: boolean, analyzed_command?: string, generated_rule?: string, message?: string }> {
    try {
        // 1. Fetch the latest attack log
        // Use provided string if automated, or pop from Redis if polling
        let logStr = specificLogStr

        if (!logStr) {
            // lpop: Remove and return the FIRST element (HEAD) of the list. 
            // Since honeypot uses lpush (adds to head), lpop gets the NEWEST log (LIFO).
            logStr = await redis.lpop('attack:logs')
        }

        // DEMO HACK: If no real logs, but we are in Mock mode, pretend we saw one.
        if (!logStr && USE_MOCK) {
            logStr = JSON.stringify({ command: "ADMIN' OR '1'='1' --" })
        }

        if (!logStr) {
            return { success: false, message: 'No new attacks to analyze.' }
        }

        const log = typeof logStr === 'string' ? JSON.parse(logStr) : logStr
        const attackCommand = log.command


        // 2. Ask Gemini (or Mock) to generate a rule
        const model = getGeminiModel()
        let regexStr = ''

        if (USE_MOCK) {
            // Mock Rules for Demo
            if (attackCommand.includes("ADMIN") || attackCommand.includes("' OR '1'='1'")) {
                regexStr = "/(' OR '1'='1')|(\\s+OR\\s+)/i"
            } else if (attackCommand.includes("<script>")) {
                regexStr = "/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/i"
            } else if (attackCommand.includes("/etc/passwd")) {
                regexStr = "/\\/etc\\/passwd/i"
            } else {
                regexStr = "/(union\\s+select|benchmark|sleep)/i" // Default Catch-all
            }
        } else {
            console.log("✨ Gemini Evolving Defense Rule...")
            const result = await model.generateContent([
                EVOLVE_SYSTEM_PROMPT,
                `Malicious Input: "${attackCommand}"`,
                `Generate Regex:`
            ])
            regexStr = result.response.text().trim()
            regexStr = regexStr.replace(/^```\/?/, '').replace(/```$/, '').trim()
        }

        // 3. Store the new rule
        // We store it at the HEAD of the list (firewall:rules)
        await redis.lpush('firewall:rules', regexStr)

        return {
            success: true,
            analyzed_command: attackCommand,
            generated_rule: regexStr
        }

    } catch (error) {
        console.error('Evolution Error:', error)
        return { success: false, message: 'Failed to evolve' }
    }
}
