"""Render the logical schema into editable draw.io and matching PNG previews.

Requires Pillow. This creates design artifacts, not executable SQL migrations.
"""
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
schema = json.loads((ROOT / "config/schema-design.json").read_text())
font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
font = ImageFont.truetype(font_path, 18)
heading = ImageFont.truetype(font_path, 25)
title_font = ImageFont.truetype(font_path, 32)
mxfile = ET.Element("mxfile", host="app.diagrams.net")

for page in schema["pages"]:
    width, height = 2020, 1730
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    title = "Database ER Diagram: " + page["name"]
    draw.text((60, 35), title, font=title_font, fill="#243449")
    diagram = ET.SubElement(mxfile, "diagram", name=page["name"], id=page["file"])
    model = ET.SubElement(diagram, "mxGraphModel", page="1", pageWidth=str(width), pageHeight=str(height))
    root = ET.SubElement(model, "root")
    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")
    cells = []
    def text_cell(cell_id, value, x, y, w, h, style):
        cell = ET.SubElement(root, "mxCell", id=cell_id, value=value, style=style, vertex="1", parent="1")
        ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(w), height=str(h), **{"as":"geometry"})
    text_cell("title", title, 60, 30, 1900, 55, "text;html=0;fontSize=32;align=left;")
    boxes = {}
    for i, table in enumerate(page["tables"]):
        x, y = 60 + (i % 3) * 660, 140 + (i // 3) * 750
        boxes[table] = (x, y, 580, 550)
    # Route in the gutters; table text lists full FK mappings for omitted references.
    for i, (source, target) in enumerate(page["links"]):
        sx, sy, sw, sh = boxes[source]
        tx, ty, tw, th = boxes[target]
        if sy == ty:
            lane = sy + sh + 25 + i * 12
            points = [(sx+sw//2,sy+sh),(sx+sw//2,lane),(tx+tw//2,lane),(tx+tw//2,ty+th)]
            entry_y = "1"
        else:
            if sy > ty:
                sx,sy,sw,sh,tx,ty,tw,th = tx,ty,tw,th,sx,sy,sw,sh
                source,target = target,source
            lane = sy+sh+25+i*12
            points = [(sx+sw//2,sy+sh),(sx+sw//2,lane),(tx+tw//2,lane),(tx+tw//2,ty)]
            entry_y = "0"
        draw.line(points, fill="#8294aa", width=3)
        # One-to-many endpoints; precise optionality is documented in the field list.
        a,b = points[0],points[-1]
        draw.line((a[0]-8,a[1]+8,a[0]+8,a[1]+8),fill="#8294aa",width=3)
        sign = -1 if entry_y == "0" else 1
        for dx in (-9,0,9):
            draw.line((b[0],b[1]+sign*15,b[0]+dx,b[1]),fill="#8294aa",width=2)
        edge = ET.SubElement(root,"mxCell",id=f"edge-{i}",source=source,target=target,edge="1",parent="1",style=f"edgeStyle=none;startArrow=ERone;endArrow=ERzeroToMany;strokeColor=#8294aa;exitX=0.5;exitY=1;entryX=0.5;entryY={entry_y};")
        geom = ET.SubElement(edge,"mxGeometry",relative="1",**{"as":"geometry"})
        arr = ET.SubElement(geom,"Array",**{"as":"points"})
        for px,py in points[1:-1]:
            ET.SubElement(arr,"mxPoint",x=str(px),y=str(py))
    for table,(x,y,w,h) in boxes.items():
        fields = schema["tables"][table]
        draw.rectangle((x,y,x+w,y+h),fill="#f4f7fb",outline="#879bb5",width=2)
        draw.rectangle((x,y,x+w,y+47),fill="#e0eaf6")
        label = table + " [" + schema["mvp_scope"]["tables"][table].upper() + "]"
        draw.text((x+14,y+10),label,font=heading,fill="#243449")
        for n,line in enumerate(fields):
            if draw.textlength(line,font=font) > w-28:
                raise ValueError(f"Field too wide: {table}: {line}")
            draw.text((x+14,y+64+n*32),line,font=font,fill="#243449")
        value = label+"\n\n"+"\n".join(fields)
        text_cell(table,value,x,y,w,h,"rounded=0;whiteSpace=wrap;html=0;fillColor=#f4f7fb;strokeColor=#879bb5;fontColor=#243449;fontSize=18;align=left;verticalAlign=top;spacing=14;")
    note = "MVP / DEFERRED labels mark scope; all 15 tables retained. Repeated tables are references.\nPK: primary key; UQ: unique; ?: nullable. Proposed design; see docs/database-design.md for rules."
    draw.multiline_text((60,1570),note,font=font,fill="#52657c",spacing=10)
    text_cell("note",note,60,1570,1880,100,"text;html=0;fontSize=18;align=left;")
    image.save(ROOT / "diagrams" / (page["file"]+".png"))
ET.indent(mxfile)
ET.ElementTree(mxfile).write(ROOT / "diagrams/database-er.drawio",encoding="utf-8",xml_declaration=True)
print(f"Rendered {len(schema['tables'])} tables across {len(schema['pages'])} diagram pages")
