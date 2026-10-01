import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import qrcode
import cv2

SRC_IMG = r'C:/Users/24603/.gemini/antigravity/brain/f35bceea-f175-418c-94a3-958874eb3305/.user_uploaded/media_1790855421348.jpg'
URL = 'https://the-first-step-7wo.pages.dev/'

OUT_DIR = r'D:/Document1/Document/AAAZYT/gemini/王佳/poster'
os.makedirs(OUT_DIR, exist_ok=True)

# Fonts
FONT_ZH_REG = 'C:/Windows/Fonts/msyhl.ttc'
FONT_ZH_BOLD = 'C:/Windows/Fonts/msyh.ttc'
FONT_EN_SANS = 'C:/Windows/Fonts/arial.ttf'
FONT_EN_MONO = 'C:/Windows/Fonts/cour.ttf'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def create_raw_qr(size=78, border=1, fill_color=(20, 20, 24), back_color=(248, 246, 242)):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=border,
    )
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert('RGBA')
    return img.resize((size, size), Image.NEAREST)

def draw_chalk_star(draw, cx, cy, r=8, color=(215, 210, 205, 210)):
    """Draw a hand-drawn chalk star matching the poster's star aesthetic."""
    # Vertical spine
    draw.line([(cx, cy - r * 1.3), (cx, cy + r * 1.3)], fill=color, width=1)
    # Horizontal spine
    draw.line([(cx - r * 0.75, cy), (cx + r * 0.75, cy)], fill=color, width=1)
    # Diagonals
    dr = r * 0.32
    c_faint = (*color[:3], int(color[3] * 0.55))
    draw.line([(cx - dr, cy - dr), (cx + dr, cy + dr)], fill=c_faint, width=1)
    draw.line([(cx - dr, cy + dr), (cx + dr, cy - dr)], fill=c_faint, width=1)
    # Core dot
    draw.ellipse([(cx - 1, cy - 1), (cx + 1, cy + 1)], fill=(255, 255, 255, 240))

def draw_tape(draw, x, y, w=38, h=14, angle=-3):
    """Draw a semi-transparent frosted washi-tape strip."""
    tape = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    td = ImageDraw.Draw(tape)
    # tape body
    td.rectangle([0, 0, w, h], fill=(235, 230, 220, 105))
    # torn left/right tape edges
    for ty in range(h):
        td.point((0, ty), fill=(245, 240, 230, random.randint(80, 160)))
        td.point((w - 1, ty), fill=(245, 240, 230, random.randint(80, 160)))
    # slight tape gloss
    td.line([(0, 2), (w, 2)], fill=(255, 255, 255, 45), width=1)
    
    rotated = tape.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    return rotated

def make_torn_paper_card(w, h, seed=77):
    """Generate realistic torn paper card with fibrous edges and warm texture."""
    random.seed(seed)
    np.random.seed(seed)
    
    scale = 3
    sw, sh = w * scale, h * scale
    pad = 12 * scale
    
    n_pts_w = max(30, sw // 10)
    n_pts_h = max(30, sh // 10)
    
    pts = []
    # Top edge
    for x in np.linspace(pad, pad + sw, n_pts_w):
        w1 = np.sin(x / 24.0) * 2.5
        w2 = np.random.uniform(-2.2, 2.2)
        pts.append((x, pad + w1 + w2))
    # Right edge
    for y in np.linspace(pad, pad + sh, n_pts_h):
        w1 = np.cos(y / 20.0) * 2.2
        w2 = np.random.uniform(-2.2, 2.2)
        pts.append((pad + sw + w1 + w2, y))
    # Bottom edge
    for x in np.linspace(pad + sw, pad, n_pts_w):
        w1 = np.sin(x / 22.0) * 2.5
        w2 = np.random.uniform(-2.2, 2.2)
        pts.append((x, pad + sh + w1 + w2))
    # Left edge
    for y in np.linspace(pad + sh, pad, n_pts_h):
        w1 = np.cos(y / 25.0) * 2.2
        w2 = np.random.uniform(-2.2, 2.2)
        pts.append((pad + w1 + w2, y))
        
    canvas_w = sw + pad * 2
    canvas_h = sh + pad * 2
    hi_card = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    hi_draw = ImageDraw.Draw(hi_card)
    
    # 1. White fibrous outer fringe (deckle edge)
    hi_draw.polygon(pts, fill=(248, 246, 242, 255))
    
    # 2. Inner warm body
    cx, cy = canvas_w / 2, canvas_h / 2
    inner_pts = []
    for px, py in pts:
        vx, vy = px - cx, py - cy
        dist = np.hypot(vx, vy)
        inner_pts.append((cx + vx * (1 - 3.5 / dist), cy + vy * (1 - 3.5 / dist)))
    hi_draw.polygon(inner_pts, fill=(244, 240, 234, 255))
    
    # Downscale for anti-aliasing
    final_w = w + 24
    final_h = h + 24
    card_down = hi_card.resize((final_w, final_h), Image.Resampling.LANCZOS)
    
    # Add subtle fiber noise
    arr = np.array(card_down, dtype=np.float32)
    alpha = arr[:, :, 3] > 20
    noise = np.random.normal(0, 3.5, (final_h, final_w))
    for c in range(3):
        arr[:, :, c] = np.clip(arr[:, :, c] + noise * alpha, 0, 255)
    
    return Image.fromarray(arr.astype(np.uint8)), pad // scale

def create_shadow(mask_img, blur_radius=7, offset=(2, 4), opacity=0.65):
    """Generate a realistic drop shadow for an RGBA object."""
    alpha = mask_img.split()[3]
    shadow = Image.new('RGBA', mask_img.size, (0, 0, 0, int(255 * opacity)))
    shadow.putalpha(alpha)
    shadow_blurred = shadow.filter(ImageFilter.GaussianBlur(blur_radius))
    return shadow_blurred

def verify_qr(image_path):
    """Verify that OpenCV can detect and decode the QR code from the generated poster."""
    try:
        pil_img = Image.open(image_path).convert('RGB')
        cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        detector = cv2.QRCodeDetector()
        val, pts, _ = detector.detectAndDecode(cv_img)
        return bool(val), val
    except Exception as e:
        return False, str(e)

# ─────────────────────────────────────────────────────────────
# 1. Variant 1: Left Torn Paper Ticket (呼应右侧撕纸世界)
# ─────────────────────────────────────────────────────────────
def generate_variant_1():
    base = Image.open(SRC_IMG).convert('RGBA')
    
    # Dimensions for ticket
    card_w, card_h = 104, 136
    paper, pad = make_torn_paper_card(card_w, card_h, seed=12)
    
    # QR code
    qr_size = 78
    qr = create_raw_qr(size=qr_size, border=1, fill_color=(22, 22, 26), back_color=(244, 240, 234))
    
    # Paste QR onto paper
    # Offset of QR within the paper card
    qr_x = pad + (card_w - qr_size) // 2
    qr_y = pad + 18
    paper.paste(qr, (qr_x, qr_y), qr)
    
    # Text on paper
    p_draw = ImageDraw.Draw(paper)
    f_zh = get_font(FONT_ZH_REG, 11)
    f_en = get_font(FONT_EN_MONO, 8)
    
    # Text: "扫码开启" & "FIRST STEP"
    t1 = "扫码开启探索"
    bbox1 = f_zh.getbbox(t1)
    t1_w = bbox1[2] - bbox1[0]
    p_draw.text((pad + (card_w - t1_w) // 2, qr_y + qr_size + 4), t1, fill=(45, 45, 50, 230), font=f_zh)
    
    t2 = "FIRST STEP"
    bbox2 = f_en.getbbox(t2)
    t2_w = bbox2[2] - bbox2[0]
    p_draw.text((pad + (card_w - t2_w) // 2, qr_y + qr_size + 19), t2, fill=(110, 110, 115, 200), font=f_en)
    
    # Create drop shadow
    shadow = create_shadow(paper, blur_radius=6, offset=(2, 3), opacity=0.7)
    
    # Position on poster:
    # "探索你的第一步" is x=129..275 (center ~202), y=350..364.
    # Place card centered at x=202, y starting around 385
    pos_x = 202 - (paper.width // 2)
    pos_y = 390
    
    # Paste shadow then paper
    base.paste(shadow, (pos_x + 2, pos_y + 3), shadow)
    base.paste(paper, (pos_x, pos_y), paper)
    
    # Add tape at top of the card
    tape = draw_tape(None, 0, 0, w=42, h=13, angle=-2)
    tape_x = pos_x + pad + (card_w - 42) // 2
    tape_y = pos_y + pad - 6
    base.paste(tape, (tape_x, tape_y), tape)
    
    # Add chalk star near card
    draw = ImageDraw.Draw(base)
    draw_chalk_star(draw, pos_x + paper.width - pad + 6, pos_y + pad + 15, r=7, color=(220, 215, 210, 220))
    
    out_path = os.path.join(OUT_DIR, 'poster_variant_1_torn_scrap.png')
    base.convert('RGB').save(out_path, quality=98)
    ok, val = verify_qr(out_path)
    print(f'Variant 1 saved: {out_path} | QR readable: {ok} ({val})')
    return out_path

# ─────────────────────────────────────────────────────────────
# 2. Variant 2: Left Minimalist Editorial Card (极简呼吸感版)
# ─────────────────────────────────────────────────────────────
def generate_variant_2():
    base = Image.open(SRC_IMG).convert('RGBA')
    
    card_w, card_h = 96, 96
    card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card)
    
    # Rounded rectangular plate with warm off-white fill and hairline border
    r = 6
    c_draw.rounded_rectangle([0, 0, card_w, card_h], radius=r, fill=(246, 244, 239, 255), outline=(215, 210, 200, 180), width=1)
    
    # QR code
    qr_size = 80
    qr = create_raw_qr(size=qr_size, border=1, fill_color=(20, 20, 24), back_color=(246, 244, 239))
    card.paste(qr, ((card_w - qr_size) // 2, (card_h - qr_size) // 2), qr)
    
    # Drop shadow
    shadow = create_shadow(card, blur_radius=8, offset=(1, 3), opacity=0.6)
    
    # Position centered under "探索你的第一步"
    pos_x = 202 - (card_w // 2)
    pos_y = 398
    
    base.paste(shadow, (pos_x + 1, pos_y + 3), shadow)
    base.paste(card, (pos_x, pos_y), card)
    
    # Elegant typography on the poster background below the card
    draw = ImageDraw.Draw(base)
    f_zh = get_font(FONT_ZH_REG, 11)
    f_en = get_font(FONT_EN_SANS, 8)
    
    t1 = "扫码开启体验"
    b1 = f_zh.getbbox(t1)
    w1 = b1[2] - b1[0]
    draw.text((202 - w1 // 2, pos_y + card_h + 10), t1, fill=(210, 206, 200, 220), font=f_zh)
    
    t2 = "SCAN TO EXPLORE"
    b2 = f_en.getbbox(t2)
    w2 = b2[2] - b2[0]
    draw.text((202 - w2 // 2, pos_y + card_h + 26), t2, fill=(140, 138, 134, 180), font=f_en)
    
    # Delicate star accents
    draw_chalk_star(draw, pos_x - 14, pos_y + 30, r=6, color=(200, 195, 190, 180))
    draw_chalk_star(draw, pos_x + card_w + 16, pos_y + 65, r=8, color=(220, 215, 210, 210))
    
    out_path = os.path.join(OUT_DIR, 'poster_variant_2_minimal_left.png')
    base.convert('RGB').save(out_path, quality=98)
    ok, val = verify_qr(out_path)
    print(f'Variant 2 saved: {out_path} | QR readable: {ok} ({val})')
    return out_path

# ─────────────────────────────────────────────────────────────
# 3. Variant 3: Bottom-Right Call-to-Action Lockup (右下角文案黄金组合)
# ─────────────────────────────────────────────────────────────
def generate_variant_3():
    base = Image.open(SRC_IMG).convert('RGBA')
    
    # Bottom right copy is at x=925..991, y=487..536.
    # Place QR code at x=825, y=455.
    card_w, card_h = 86, 86
    card = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card)
    
    # Warm off-white plate with subtle border
    c_draw.rounded_rectangle([0, 0, card_w, card_h], radius=6, fill=(246, 244, 240, 255), outline=(215, 210, 202, 160), width=1)
    
    qr_size = 76
    qr = create_raw_qr(size=qr_size, border=2, fill_color=(20, 20, 24), back_color=(246, 244, 240))
    card.paste(qr, ((card_w - qr_size) // 2, (card_h - qr_size) // 2), qr)
    
    shadow = create_shadow(card, blur_radius=7, offset=(1, 2), opacity=0.6)
    
    pos_x = 825
    pos_y = 455
    
    base.paste(shadow, (pos_x + 1, pos_y + 2), shadow)
    base.paste(card, (pos_x, pos_y), card)
    
    # Subtle label above or beside
    draw = ImageDraw.Draw(base)
    f_zh = get_font(FONT_ZH_REG, 10)
    t = "扫码预演体验"
    b = f_zh.getbbox(t)
    tw = b[2] - b[0]
    draw.text((pos_x + (card_w - tw) // 2, pos_y - 15), t, fill=(195, 192, 188, 210), font=f_zh)
    
    # Small chalk star between QR and bottom-right text
    draw_chalk_star(draw, pos_x + card_w + 7, pos_y + 10, r=5, color=(210, 205, 200, 190))
    
    out_path = os.path.join(OUT_DIR, 'poster_variant_3_bottom_right.png')
    base.convert('RGB').save(out_path, quality=98)
    ok, val = verify_qr(out_path)
    print(f'Variant 3 saved: {out_path} | QR readable: {ok} ({val})')
    return out_path

# ─────────────────────────────────────────────────────────────
# 4. Variant 4: Torn Ticket at Bottom Right (右下角撕纸票根)
# ─────────────────────────────────────────────────────────────
def generate_variant_4():
    base = Image.open(SRC_IMG).convert('RGBA')
    
    card_w, card_h = 82, 98
    paper, pad = make_torn_paper_card(card_w, card_h, seed=45)
    
    qr_size = 66
    qr = create_raw_qr(size=qr_size, border=1, fill_color=(22, 22, 26), back_color=(244, 240, 234))
    
    qr_x = pad + (card_w - qr_size) // 2
    qr_y = pad + 8
    paper.paste(qr, (qr_x, qr_y), qr)
    
    p_draw = ImageDraw.Draw(paper)
    f_zh = get_font(FONT_ZH_REG, 10)
    t = "扫码预演"
    tb = f_zh.getbbox(t)
    tw = tb[2] - tb[0]
    p_draw.text((pad + (card_w - tw) // 2, qr_y + qr_size + 3), t, fill=(45, 45, 50, 230), font=f_zh)
    
    shadow = create_shadow(paper, blur_radius=6, offset=(1, 3), opacity=0.65)
    
    pos_x = 828
    pos_y = 448
    
    base.paste(shadow, (pos_x + 1, pos_y + 3), shadow)
    base.paste(paper, (pos_x, pos_y), paper)
    
    draw = ImageDraw.Draw(base)
    draw_chalk_star(draw, pos_x - 8, pos_y + 16, r=6, color=(210, 205, 200, 200))
    
    out_path = os.path.join(OUT_DIR, 'poster_variant_4_right_torn.png')
    base.convert('RGB').save(out_path, quality=98)
    ok, val = verify_qr(out_path)
    print(f'Variant 4 saved: {out_path} | QR readable: {ok} ({val})')
    return out_path

if __name__ == '__main__':
    v1 = generate_variant_1()
    v2 = generate_variant_2()
    v3 = generate_variant_3()
    v4 = generate_variant_4()
    print('All variants generated and verified.')
