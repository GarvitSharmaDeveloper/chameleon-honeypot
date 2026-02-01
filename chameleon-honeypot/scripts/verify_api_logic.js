// Simulate the API logic to verify the fix
const patches = [
    JSON.stringify({ trigger: "Stringified JSON", patch: "patch code" }),
    { trigger: "Already Object", patch: "patch code" }, // Simulate Redis return object
    "Invalid JSON", // Should result in "Unknown"
    null, // Should result in "Unknown" (handled safely)
    undefined // Should result in "Unknown" (handled as try/catch or fallthrough? undefined is not object)
]

console.log("Input patches:", patches)

const formattedPatches = patches.map(p => {
    // START FIX LOGIC
    if (typeof p === 'object' && p !== null) return p;
    try {
        const parsed = JSON.parse(p);
        return (typeof parsed === 'object' && parsed !== null) ? parsed : { trigger: 'Unknown', patch: p };
    } catch {
        return { trigger: 'Unknown', patch: p }
    }
    // END FIX LOGIC
})

console.log("\nFormatted Output:")
let success = true
formattedPatches.forEach((p, i) => {
    // p should never be null now
    if (!p) {
        console.error(`[${i}] ERROR: Result is null/undefined!`)
        success = false
        return
    }

    // Check trigger exists
    const trigger = p.trigger
    console.log(`[${i}] Trigger: "${trigger}"`)

    if (i === 1 && trigger !== "Already Object") success = false
    if (i === 2 && trigger !== "Unknown") success = false
    if (i === 3 && trigger !== "Unknown") success = false
})

if (success) {
    console.log("\n✅ VERIFICATION PASSED: Logic handles objects, strings, and nulls safely.")
} else {
    console.error("\n❌ VERIFICATION FAILED.")
    process.exit(1)
}
