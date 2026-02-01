import { Stagehand } from '@browserbasehq/stagehand';
import path from 'path';
import fs from 'fs';

export async function generateEvidence(attackData: {
    command: string,
    severity: string,
    date: string,
    ip?: string
}): Promise<string> {
    const evidenceDir = path.join(process.cwd(), 'public', 'evidence');

    if (!fs.existsSync(evidenceDir)) {
        fs.mkdirSync(evidenceDir, { recursive: true });
    }

    let stagehand: Stagehand | null = null;
    try {
        console.log('📸 Connecting to Browserbase via Stagehand...');

        // 1. Initialize Stagehand
        try {
            stagehand = new Stagehand({
                env: "BROWSERBASE",
                apiKey: process.env.BROWSERBASE_API_KEY,
                projectId: process.env.BROWSERBASE_PROJECT_ID,
                verbose: 1,
            });

            await stagehand.init();
            console.log(`✅ Stagehand Session Connected`);
        } catch (initError) {
            console.log('❌ Stagehand Init Failed (likely network block), proceeding to fallback...');
            throw initError;
        }

        // Access the page via context
        const page = stagehand.context.activePage();

        if (!page) {
            throw new Error("Stagehand initialized but no active page found.");
        }

        // Create the Forensic Receipt HTML
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        background-color: #0f172a;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: 'Courier New', Courier, monospace;
                    }
                    .receipt {
                        background: #1e293b;
                        color: #00ff00; /* Green terminal text */
                        width: 400px;
                        padding: 30px;
                        border: 2px solid #334155;
                        box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
                        position: relative;
                        overflow: hidden;
                    }
                    .receipt::before {
                        content: '';
                        position: absolute;
                        top: 0; left: 0; right: 0; height: 5px;
                        background: repeating-linear-gradient(90deg, #334155 0, #334155 10px, transparent 10px, transparent 20px);
                    }
                    h1 {
                        text-align: center;
                        border-bottom: 2px dashed #334155;
                        padding-bottom: 20px;
                        margin-top: 0;
                        color: #e2e8f0;
                        font-size: 24px;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        font-size: 14px;
                    }
                    .label { color: #94a3b8; }
                    .value { font-weight: bold; text-align: right; max-width: 60%; word-break: break-all; }
                    .critical { color: #ef4444; }
                    .high { color: #f97316; }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px dashed #334155;
                        text-align: center;
                        font-size: 10px;
                        color: #64748b;
                    }
                    .stamp {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-15deg);
                        font-size: 40px;
                        border: 4px solid rgba(255, 0, 0, 0.3);
                        color: rgba(255, 0, 0, 0.3);
                        padding: 10px;
                        text-transform: uppercase;
                        pointer-events: none;
                        font-weight: 900;
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <h1>CHAMELEON SECURITY<br><span style="font-size: 14px; color: #fff;">INCIDENT REPORT</span></h1>
                    
                    <div class="row">
                        <span class="label">TIMESTAMP</span>
                        <span class="value">${attackData.date}</span>
                    </div>
                    <div class="row">
                        <span class="label">IP ADDRESS</span>
                        <span class="value">${attackData.ip || 'UNKNOWN'}</span>
                    </div>
                    <div class="row">
                        <span class="label">SEVERITY</span>
                        <span class="value ${attackData.severity.toLowerCase() === 'critical' ? 'critical' : 'high'}">${attackData.severity.toUpperCase()}</span>
                    </div>
                    <div class="row">
                        <span class="label">COMMAND</span>
                        <span class="value">${attackData.command}</span>
                    </div>
                     <div class="row">
                        <span class="label">STATUS</span>
                        <span class="value">LOGGED & TRACED</span>
                    </div>

                    <div class="footer">
                        EVIDENCE GENERATED BY BROWSERBASE INFRASTRUCTURE (STAGEHAND)
                        <br>
                        SECURE CLOUD BROWSER ISOLATION
                    </div>
                    
                    <div class="stamp">EVIDENCE LOGGED</div>
                </div>
            </body>
            </html>
        `;

        await page.evaluate((html) => {
            document.open();
            document.write(html as string);
            document.close();
        }, htmlContent);

        const filename = `evidence-${Date.now()}.png`;
        const filePath = path.join(evidenceDir, filename);

        // Take screenshot
        await page.screenshot({ path: filePath });

        await stagehand.close();

        return `/evidence/${filename}`;

    } catch (error) {
        console.error('Stagehand Evidence Generation Failed:', error);

        try {
            if (stagehand) await stagehand.close();
        } catch (e) { }

        // FAILOVER: Generate Local SVG Evidence
        console.log('⚠️ Network Blocked? Generating Local Fallback Evidence (SVG)...');

        try {
            const fallbackFilename = `evidence-fallback-${Date.now()}.svg`;
            const fallbackPath = path.join(evidenceDir, fallbackFilename);

            const svgContent = `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg { fill: #1e293b; }
    .title { fill: #e2e8f0; font-family: monospace; font-size: 24px; font-weight: bold; text-anchor: middle; }
    .subtitle { fill: #94a3b8; font-family: monospace; font-size: 14px; text-anchor: middle; }
    .label { fill: #94a3b8; font-family: monospace; font-size: 14px; }
    .value { fill: #22c55e; font-family: monospace; font-size: 14px; font-weight: bold; }
    .critical { fill: #ef4444; }
    .border { fill: none; stroke: #334155; stroke-width: 2; }
    .footer { fill: #64748b; font-family: monospace; font-size: 10px; text-anchor: middle; }
  </style>
  <rect x="0" y="0" width="600" height="400" class="bg" />
  <rect x="10" y="10" width="580" height="380" class="border" />
  
  <text x="300" y="50" class="title">CHAMELEON SECURITY</text>
  <text x="300" y="75" class="subtitle">INCIDENT REPORT (OFFLINE MODE)</text>
  
  <text x="50" y="130" class="label">TIMESTAMP:</text>
  <text x="180" y="130" class="value">${attackData.date}</text>
  
  <text x="50" y="160" class="label">IP ADDRESS:</text>
  <text x="180" y="160" class="value">${attackData.ip || 'UNKNOWN'}</text>
  
  <text x="50" y="190" class="label">SEVERITY:</text>
  <text x="180" y="190" class="value ${attackData.severity.toLowerCase() === 'critical' ? 'critical' : ''}">${attackData.severity.toUpperCase()}</text>
  
  <text x="50" y="220" class="label">COMMAND:</text>
  <text x="50" y="240" class="value" width="500">${attackData.command.length > 50 ? attackData.command.substring(0, 50) + '...' : attackData.command}</text>

  <text x="300" y="320" class="footer">Evidence captured locally due to cloud connection timeout.</text>
  <text x="300" y="340" class="footer">Browserbase Secure Isolation currently unreachable.</text>
</svg>`;

            fs.writeFileSync(fallbackPath, svgContent);
            console.log(`✅ Fallback Evidence Generated: ${fallbackPath}`);
            return `/evidence/${fallbackFilename}`;

        } catch (filesError) {
            console.error('Fallback Generation Failed:', filesError);
            return '';
        }
    }
}
