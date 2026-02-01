import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    // If we reach here, middleware didn't block us.
    return NextResponse.json({ output: "Authentication Logic Executed. Welcome to the Real App." })
}
