/* خادمُ ملفّاتٍ ثابتةٍ بلا اعتماديّات — لنشرِ الموقعِ على سيرفر (Railway وغيرِه) */
const http = require("http");
const fs   = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const TYPES = {
  ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".svg":"image/svg+xml",
  ".webp":"image/webp", ".ico":"image/x-icon", ".woff2":"font/woff2", ".txt":"text/plain; charset=utf-8",
  ".md":"text/markdown; charset=utf-8"
};

/* ملفّاتٌ لا تُخدَم */
const DENY = new Set(["server.js","package.json","package-lock.json","railway.json"]);

http.createServer((req,res)=>{
  let pathname;
  /* توحيدُ الشرطاتِ المكرّرةِ أوّلاً: "//" وحدَها تُفسَّرُ عنواناً بلا مضيفٍ وترمي خطأ */
  const raw = req.url.replace(/\/{2,}/g,"/");
  try { pathname = decodeURIComponent(new URL(raw,"http://localhost").pathname); }
  catch { return send(res,400,"Bad Request"); }

  if (pathname.endsWith("/")) pathname += "index.html";

  const rel  = pathname.replace(/^\/+/,"");
  const file = path.resolve(ROOT, rel);

  /* منعُ الخروجِ من المجلّدِ والملفّاتِ المخفيّةِ والمحجوبة */
  if (!file.startsWith(ROOT + path.sep)) return send(res,403,"Forbidden");
  if (rel.split("/").some(p => p.startsWith(".")))  return send(res,404,"Not Found");
  if (DENY.has(path.basename(file)))                return send(res,404,"Not Found");

  fs.stat(file,(err,st)=>{
    if (err || !st.isFile()) return send(res,404,"Not Found");
    const ext  = path.extname(file).toLowerCase();
    const html = ext === ".html";
    res.writeHead(200,{
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Content-Length": st.size,
      "Cache-Control": html ? "no-cache" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT,()=>console.log("Prime Hub على المنفذ "+PORT));

function send(res,code,msg){
  res.writeHead(code,{"Content-Type":"text/plain; charset=utf-8"});
  res.end(msg);
}
