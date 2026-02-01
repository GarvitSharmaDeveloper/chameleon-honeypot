'use client'

import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, User, Lock, AlertTriangle } from 'lucide-react'

export default function LoginTrapPage() {
    const [loading, setLoading] = useState(false)
    const [command, setCommand] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // TRAP LOGIC: Send the input to the Honeypot API
        try {
            await fetch('/api/honeypot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: `LOGIN_ATTEMPT: ${command}` })
            })
        } catch (e) { }

        // Simulate fake delay
        await new Promise(r => setTimeout(r, 1500))

        // Always fail or give fake success
        toast.error("Authentication Failed", {
            description: "Invalid Credentials. Incident Logged.",
            style: { background: '#450a0a', color: '#fca5a5', border: '1px solid #ef4444' }
        })
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-mono text-blue-100">
            {/* Background Effects (Slightly different glitch effect for trap?) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none" />

            <Toaster position="top-center" richColors theme="dark" />

            <Card className="w-full max-w-md bg-slate-900/80 border-blue-900/50 shadow-[0_0_40px_rgba(30,58,138,0.3)] backdrop-blur-md">
                <CardHeader className="text-center space-y-2 border-b border-blue-900/30 pb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-2 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-blue-100 uppercase">
                        Hunter Association
                    </CardTitle>
                    <p className="text-sm text-blue-400/60 uppercase tracking-widest">Authorized Access Only</p>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-blue-500 tracking-wider ml-1">Hunter Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-blue-700" />
                                <Input
                                    value={command}
                                    onChange={e => setCommand(e.target.value)}
                                    placeholder="Enter ID..."
                                    className="pl-9 bg-slate-950 border-blue-900/50 text-blue-100 focus:border-blue-500 transition-colors h-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-blue-500 tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-blue-700" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-slate-950 border-blue-900/50 text-blue-100 focus:border-blue-500 transition-colors h-10"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold border border-blue-500 h-11 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                        >
                            {loading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-blue-900/30 pt-4">
                    <p className="text-xs text-blue-900/60 font-mono">SECURE GATEWAY v3.2.1 // LEVEL 1</p>
                </CardFooter>
            </Card>
        </div>
    )
}
