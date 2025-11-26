from fastapi import FastAPI

app = FastAPI(title="CreativeHub AI Service")

@app.get("/health")
async def health():
    return {"status": "ok"}

# TODO:
# - /audio/separate
# - /audio/voice-clone
# - /image/enhance
# - /image/style-transfer

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
