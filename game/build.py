"""Extrae las 96 cartas (banco + mazo Acción) de docs/velada/ y las inserta en game/velada.html."""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
md = "\n".join((root / "docs/velada" / f).read_text(encoding="utf-8")
               for f in ("03-banco-de-cartas.md", "03b-mazo-accion.md"))
cards, level = [], 0
for line in md.splitlines():
    if line.startswith("## Nivel "):
        level = int(line.split()[2])
    m = re.match(r"^\| (\d+) \| (Sola|Pareja) \| ([^|]+) \| (.+) \| (`.*`) \|$", line)
    if m:
        text = m.group(4).replace("**", "").strip()
        cards.append({"id": int(m.group(1)), "level": level, "mode": m.group(2),
                      "type": m.group(3).strip(), "text": text})
assert len(cards) == 96, len(cards)
tpl = (root / "game/template.html").read_text(encoding="utf-8")
out = tpl.replace("/*__CARDS__*/[]", json.dumps(cards, ensure_ascii=False))
(root / "game/velada.html").write_text(out, encoding="utf-8")
print("ok", len(cards))
