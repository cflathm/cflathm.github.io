"""Regenerate the checked-in social preview with Python and Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
im = Image.new('RGB', (1200,630), '#101d30')
draw = ImageDraw.Draw(im)
font_dir = Path('C:/Windows/Fonts')
if not font_dir.exists(): font_dir = Path('/usr/share/fonts/truetype/dejavu')
font_file = font_dir / ('arial.ttf' if (font_dir/'arial.ttf').exists() else 'DejaVuSans.ttf')
def font(size): return ImageFont.truetype(str(font_file),size)
draw.line((60,95,1140,95), fill='#33445b',width=1)
draw.text((60,45),'CHRISTOPHER FLATHMANN',font=font(23),fill='#a5cbff')
for i,line in enumerate(['I build AI that','helps people','work together.']):
    draw.text((58,155+i*78),line,font=font(65),fill='#a5cbff' if i==2 else '#f5f6f3')
draw.text((60,507),'AI, people, and how we work together.',font=font(23),fill='#c4d0df')
draw.text((60,553),'chrisflathmann.com',font=font(19),fill='#a5cbff')
portrait=Image.open(root/'public/square.jpg').convert('RGB')
side=min(portrait.size); left=(portrait.width-side)//2; top=(portrait.height-side)//2
portrait=portrait.crop((left,top,left+side,top+side)).resize((340,340),Image.Resampling.LANCZOS)
im.paste(portrait,(800,157))
draw.text((800,522),'Clemson University',font=font(20),fill='#c4d0df')
im.save(root/'public/social.jpg',quality=90,optimize=True)
