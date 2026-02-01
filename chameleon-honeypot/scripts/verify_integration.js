// verify_integration.js
async function run() {
    console.log("Starting Traffic Simulation (Blue Graph)...");

    const commands = ['status', 'help', 'check_version', 'ping', 'system_info'];

    for (let i = 0; i < 5; i++) {
        const cmd = commands[i];
        try {
            // Using native fetch (Node 18+)
            const res = await fetch('http://localhost:3000/api/honeypot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd })
            });
            console.log(`[TRAPPED] Sent '${cmd}' -> Status: ${res.status}`);
        } catch (e) {
            console.error(`[ERROR] Is server running? ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 500)); // Delay for visual effect
    }
    console.log("Traffic simulation complete.");
}
run();
