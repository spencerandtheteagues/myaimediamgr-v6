import os, uuid, base64
from pathlib import Path

USE_MOCK = os.getenv("USE_MOCK_GENERATION", "false").lower() == "true"
DATA_DIR = Path("/app/generated"); DATA_DIR.mkdir(parents=True, exist_ok=True)

def _safe(ext): return f"{uuid.uuid4().hex}.{ext.lstrip('.')}"

# --- TEXT ---
def gen_text(prompt: str) -> str:
    if not prompt: return "Please provide a prompt."
    if USE_MOCK or not os.getenv("GEMINI_API_KEY"):
        return f"[MOCK TEXT] {prompt[:200]}"
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp = model.generate_content(prompt)
        return (resp.text or "").strip() or "[EMPTY]"
    except Exception as e:
        return f"[FALLBACK TEXT] {prompt[:200]} (err: {e})"

# --- IMAGE ---
def gen_image(prompt: str) -> str:
    out = DATA_DIR / _safe("png")
    if USE_MOCK or not os.getenv("GEMINI_API_KEY"):
        return _placeholder_png(prompt, out)
    try:
        import requests
        key = os.environ["GEMINI_API_KEY"]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate?key={key}"
        r = requests.post(url, json={"prompt": {"text": prompt}}, timeout=90)
        r.raise_for_status()
        data = r.json()
        b64 = data["candidates"][0]["content"]["parts"][0]["inline_data"]["data"]
        with open(out, "wb") as f: f.write(base64.b64decode(b64))
        return str(out)
    except Exception as e:
        return _placeholder_png(f"{prompt} (fallback: {e})", out)

def _placeholder_png(text: str, out):
    from PIL import Image, ImageDraw, ImageFont
    im = Image.new("RGB", (1024, 576), (15,17,34))
    d = ImageDraw.Draw(im)
    try: font = ImageFont.truetype("DejaVuSans.ttf", 32)
    except Exception: font = ImageFont.load_default()
    d.text((30,30), "MyAiMediaMgr", fill=(168,85,247), font=font)
    d.text((30,90), text[:400], fill=(230,230,230), font=font, spacing=8)
    im.save(out, "PNG")
    return str(out)

# --- VIDEO (no ImageMagick; pure PIL frames -> moviepy ImageSequenceClip) ---
def gen_video(prompt: str, seconds: int = 6) -> str:
    out = DATA_DIR / _safe("mp4")
    return _placeholder_mp4(prompt, out, seconds)

def _placeholder_mp4(text: str, out, seconds: int):
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np
    from moviepy.editor import ImageSequenceClip

    w, h, fps = 1024, 576, 24
    frames = []
    for _ in range(seconds * fps):
        im = Image.new("RGB", (w, h), (15,17,34))
        d = ImageDraw.Draw(im)
        try: font = ImageFont.truetype("DejaVuSans.ttf", 36)
        except Exception: font = ImageFont.load_default()
        d.text((30,30), "MyAiMediaMgr", fill=(168,85,247), font=font)
        d.text((30,90), text[:120], fill=(230,230,230), font=font, spacing=8)
        frames.append(np.array(im))
    clip = ImageSequenceClip(frames, fps=fps)
    clip.write_videofile(str(out), codec="libx264", fps=fps, audio=False, logger=None)
    return str(out)
