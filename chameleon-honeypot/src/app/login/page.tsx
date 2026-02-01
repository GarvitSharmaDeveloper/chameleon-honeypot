'use client'

import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Send credentials to Honeypot API
            const command = `AUTH_ATTEMPT user='${username}' pass='${password}'`
            await fetch('/api/honeypot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            })

            // Simulate real login delay
            await new Promise(r => setTimeout(r, 1500))

            toast.error("ACCESS DENIED", {
                description: "Invalid credentials. Incident reported.",
                style: { background: '#450a0a', color: '#f87171', border: '1px solid #b91c1c' }
            })
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Toaster position="top-center" theme="dark" />

            <div className="flex-1 flex flex-col bg-slate-50">
                <div className="border-b border-slate-200 bg-white p-4">
                    <h1 className="text-slate-800 flex items-center gap-2 text-sm font-sans font-medium">
                        <Shield className="w-4 h-4 text-blue-600" /> Administrative Portal (Legacy)
                    </h1>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl bg-white border-slate-200 shadow-xl overflow-hidden">
                        <CardContent className="p-12">
                            <div className="space-y-8 border border-slate-200 p-8 rounded bg-white shadow-sm">
                                <h3 className="text-center text-slate-800 font-sans text-2xl font-semibold border-b border-slate-100 pb-4">Login Required</h3>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600 uppercase font-bold tracking-wider">Username</label>
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter username"
                                            className="h-14 text-lg bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600 uppercase font-bold tracking-wider">Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                                className="h-14 text-lg bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        {loading ? "Signing In..." : "Sign In"}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
