from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

app = FastAPI(title="Worm Chat")

# Serve static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- In-memory data (for POC) ---
telemetry = {"temperature": 20, "humidity": 25}
feed_log = []

# Shared secret for ThingsBoard webhook
TB_SECRET = os.getenv("THINGSBOARD_SECRET", "changeme")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/status")
async def get_status():
    if telemetry["humidity"] < 35:
        status = "too_dry"
    else:
        status = "ok"
    return {"temperature": telemetry["temperature"], "humidity": telemetry["humidity"], "status": status}

@app.post("/api/feed")
async def post_feed(data: dict):
    feed_log.append(data)
    return {"message": f"Yum! Thanks for {data.get('amountCups')} cups of {data.get('foodType')} 🪱"}

@app.post("/api/webhook/thingsboard")
async def update_telemetry(payload: dict, x_tb_key: str = Header(None)):
    if x_tb_key != TB_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    telemetry.update(payload.get("telemetry", {}))
    return {"ok": True}
