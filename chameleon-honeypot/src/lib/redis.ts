
// Simple Redis Mock that talks to our internal API (to avoid Edge Runtime FS errors)
import { Redis } from '@upstash/redis'

class MockRedis {
    private baseUrl: string

    constructor() {
        // Use localhost for server-side fetches. 
        // In prod this needs the real domain, but for demo localhost is fine.
        this.baseUrl = 'http://localhost:3000/api/mock-store'
    }

    private async request(method: string, payload: any) {
        try {
            const res = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method, ...payload }),
                cache: 'no-store'
            })
            const data = await res.json()
            return data.result
        } catch (e) {
            console.error("MockRedis Request Error:", e)
            return method === 'lrange' ? [] : null
        }
    }

    async lpush(key: string, ...values: any[]) {
        // value stringification happens here to match typical usage
        const strValues = values.map(v => typeof v === 'string' ? v : JSON.stringify(v))
        return this.request('lpush', { key, values: strValues })
    }

    async lpop(key: string) {
        return this.request('lpop', { key })
    }

    async rpop(key: string) {
        return this.request('rpop', { key })
    }

    async lrange(key: string, start: number, end: number) {
        return this.request('lrange', { key, start, end })
    }

    async get(key: string): Promise<string | null> {
        return this.request('get', { key })
    }

    async set(key: string, value: any) {
        return this.request('set', { key, value: typeof value === 'string' ? value : JSON.stringify(value) })
    }

    async setex(key: string, seconds: number, value: any) {
        return this.set(key, value)
    }
}

// Check if we have real credentials
const hasCredentials = process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    process.env.UPSTASH_REDIS_REST_TOKEN !== 'mock'

export const redis = hasCredentials
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : new MockRedis() as any as Redis // Type casting to satisfy TS
