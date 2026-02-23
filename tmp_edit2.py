from pathlib import Path
import re
p=Path("app/main.py")
text=p.read_text()
pattern=r'allow_origin_regex=r"[^"]*"'
repl=r'allow_origin_regex=r"https://.*(vercel\.app|onrender\.com)$|http://(localhost|127\.0\.0\.1)(:\\d+)?"'
text=re.sub(pattern, repl, text)
p.write_text(text)
