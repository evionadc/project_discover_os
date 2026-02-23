from pathlib import Path
import re
p=Path("app/main.py")
text=p.read_text()
new_list='allowed_origins = [\n    "http://localhost:5173",\n    "http://127.0.0.1:5173",\n    "http://localhost:4173",\n    "http://127.0.0.1:4173",\n    "https://project-discover-os.vercel.app",\n    "https://project-discover-os.onrender.com",\n]'
text=re.sub(r"allowed_origins = \[.*?\]", new_list, text, flags=re.S)
text=re.sub(r"allow_origin_regex=r\"http://\(localhost\|127\\.0\\.0\\.1\)(:\\d+)?\"", r"allow_origin_regex=r\"https://.*(vercel\\.app|onrender\\.com)$|http://(localhost|127\\.0\\.0\\.1)(:\\d+)?\"", text)
p.write_text(text)
