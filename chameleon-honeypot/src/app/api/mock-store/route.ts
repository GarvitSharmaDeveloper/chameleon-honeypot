import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// This API Route runs in Node.js (default), so it CAN use fs.
// It acts as a bridge for the Middleware (Edge) to read/write the mock DB.

const DB_PATH = path.join(process.cwd(), '.redis-mock.json')

function getStore() {
    try {
        if (!fs.existsSync(DB_PATH)) return {}
        const data = fs.readFileSync(DB_PATH, 'utf-8')
        return JSON.parse(data)
    } catch (e) {
        return {}
    }
}

function saveStore(store: any) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2))
    } catch (e) {
        console.error("Store write error", e)
    }
}

export async function GET(req: Request) {
    const store = getStore()
    return NextResponse.json(store)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { method, key, values, start, end } = body
        const store = getStore()

        // Initialize list if needed
        if (!store[key]) store[key] = []

        let result = null

        if (method === 'lpush') {
            for (const v of values) {
                store[key].unshift(v)
            }
            saveStore(store)
            result = store[key].length
        }
        else if (method === 'lpop') {
            if (store[key] && store[key].length > 0) {
                result = store[key].shift()
                saveStore(store)
            } else {
                result = null
            }
        }
        else if (method === 'rpop') {
            if (store[key].length > 0) {
                result = store[key].pop()
                saveStore(store)
            } else {
                result = null
            }
        }
        else if (method === 'lrange') {
            if (end === -1) result = store[key].slice(start)
            else result = store[key].slice(start, end + 1)
        }
        else if (method === 'get') {
            result = store[key] || null
        }
        else if (method === 'set') {
            const { value } = body
            store[key] = value
            saveStore(store)
            result = 'OK'
        }

        return NextResponse.json({ result })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
