"""Render simple native draw.io context/backend sources to matching PNGs. Requires Pillow."""
from pathlib import Path
import xml.etree.ElementTree as E, math
from PIL import Image,ImageDraw,ImageFont
r=Path(__file__).resolve().parents[1]
for name in ['backend-components','system-context']:
 tree=E.parse(r/'diagrams'/(name+'.drawio'))
 model=tree.find('.//mxGraphModel')
 cells=list(tree.iter('mxCell'));boxes={c.get('id'):tuple(float(c.find('mxGeometry').get(k,'0')) for k in ['x','y','width','height']) for c in cells if c.get('vertex')=='1'}
 im=Image.new('RGB',(int(model.get('pageWidth','2000')),int(model.get('pageHeight','1480'))),'white');d=ImageDraw.Draw(im)
 def style(c):return dict(x.split('=',1) for x in c.get('style','').split(';') if '=' in x)
 def rect(c):
  x,y,w,h=boxes[c.get('id')];s=style(c)
  if s.get('fillColor'): d.rounded_rectangle((x,y,x+w,y+h),radius=15,fill=s['fillColor'],outline=s.get('strokeColor','#96acc6'),width=2)
 for c in cells:
  if c.get('id')=='boundary':rect(c)
 def border(box,point):
  x,y,w,h=box;cx,cy=x+w/2,y+h/2;dx,dy=point[0]-cx,point[1]-cy
  scale=min(w/2/abs(dx) if dx else float('inf'),h/2/abs(dy) if dy else float('inf'))
  return (cx+dx*scale,cy+dy*scale)
 for c in cells:
  if c.get('edge')!='1':continue
  a,b=boxes[c.get('source')],boxes[c.get('target')];pts=[(float(q.get('x')),float(q.get('y'))) for q in c.findall('.//mxPoint')]
  ac=(a[0]+a[2]/2,a[1]+a[3]/2);bc=(b[0]+b[2]/2,b[1]+b[3]/2)
  pts=[border(a,pts[0] if pts else bc)]+pts+[border(b,pts[-1] if pts else ac)];d.line(pts,fill='#66758a',width=3)
  px,py=pts[-1];qx,qy=pts[-2];ang=math.atan2(py-qy,px-qx)
  d.polygon([(px,py),(px-13*math.cos(ang)+6*math.sin(ang),py-13*math.sin(ang)-6*math.cos(ang)),(px-13*math.cos(ang)-6*math.sin(ang),py-13*math.sin(ang)+6*math.cos(ang))],fill='#66758a')
 for c in cells:
  if c.get('vertex')!='1' or c.get('id')=='boundary':continue
  rect(c);s=style(c);x,y,w,h=boxes[c.get('id')];size=int(s.get('fontSize','23'));f=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',size);txt=c.get('value','');bb=d.multiline_textbbox((0,0),txt,font=f,spacing=8,align='center');d.multiline_text((x+w/2,y+h/2-(bb[3]-bb[1])/2),txt,font=f,fill=s.get('fontColor','#243449'),spacing=8,align='center',anchor='ma')
 im.save(r / 'diagrams' / (name + '.png'))
