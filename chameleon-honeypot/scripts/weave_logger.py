import weave
import sys
import json
import os
import asyncio

import wandb

# Manually load .env.local because Node.js spawn env propagation is flaky
try:
    with open('.env.local', 'r') as f:
        for line in f:
            if line.startswith('WANDB_API_KEY='):
                key = line.strip().split('=', 1)[1].strip('"').strip("'")
                os.environ['WANDB_API_KEY'] = key
                print(f"🔑 Found Weave Key: {key[:4]}...")
                wandb.login(key=key)
                break
except Exception as e:
    print(f"⚠️ Could not read .env.local: {e}")

# Initialize Weave Project
weave.init("chameleon-honeypot")

@weave.op()
def honeypot_interaction(attacker_ip: str, command: str) -> dict:
    """
    Logs the attacker's command and the honeypot's response.
    In a real scenario, this function might actually CALL the LLM.
    Here, we are just logging what the Node.js backend already did.
    """
    return {
        "status": "trapped", 
        "risk_score": 0.95,
        "persona": "MySQL Legacy"
    }

async def main():
    try:
        # Read JSON input from argument (passed by Node.js)
        if len(sys.argv) < 2:
            print("Usage: python3 weave_logger.py '<json_string>'")
            sys.exit(1)

        data = json.loads(sys.argv[1])
        
        # Log the Trace
        # We wrap it in a 'call' to show inputs/outputs in Weave
        with weave.attributes({"client_ip": data.get("ip")}):
            # We are "tracing" the fact that an attack happened
            res = honeypot_interaction(
                attacker_ip=data.get("ip"), 
                command=data.get("command")
            )
            
            # If we had the actual LLM response text, we could log it too
            # For now, we just log the event structure
            print(json.dumps({"success": True, "trace_id": "generated_by_weave"}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    asyncio.run(main())
