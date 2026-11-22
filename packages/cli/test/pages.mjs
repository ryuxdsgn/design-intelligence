// Static pages for the rendered checks (`ryux scan <url>`). scan.test.mjs renders them through the CLI, and the
// probe parity test renders them in Chromium, reads them with the shipped in-page extract, and records what
// ryux-core judges into fixtures/checks/probe.json.
const head = `<!doctype html><meta name="viewport" content="width=device-width">`;

/** Overflow, contrast, targets, a collision, and what the probe must skip (text on a photo, hidden text, disabled). */
export const BASICS = `${head}<style>
body{margin:0;font:16px sans-serif;background:#fff}.wide{width:600px}.grey{color:#bbb}
.hero{position:relative;height:80px}.hero img{position:absolute;inset:0;width:100%;height:100%}.hero p{position:relative;color:#fff}
.icons button{width:16px;height:16px;padding:0;margin:0;border:0}.over{position:relative}.over span{position:absolute;top:0;left:0}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}</style>
<div class="wide">wide</div><p class="grey">grey text</p><p>dark text</p>
<div class="hero"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="><p>white on a photo</p></div>
<div class="icons"><button aria-label="a"></button><button aria-label="b"></button></div>
<p>Read <a href="#">the terms</a> first.</p><div class="over"><b>Rp50.000</b><span>Big sale</span></div>
<div class="sr">hidden header</div><span>hidden header</span><button disabled style="color:#ccc">Off</button>`;

/** A phone frame whose bottom bar repeats the total; pad 0 cuts it, pad 96 leaves room. */
export const bar = (pad) => `${head}<style>
body{margin:0;font:16px/20px sans-serif;background:#fff;color:#111}.phone{position:relative;height:600px;overflow:hidden}
.content{height:100%;overflow-y:auto;padding-bottom:${pad}px;box-sizing:border-box}.gap{height:${pad ? 400 : 510}px}.tail{height:400px}
.bar{position:absolute;left:0;right:0;bottom:0;height:80px;background:#fff;border-top:1px solid #ccc}</style>
<div class="phone"><div class="content"><div class="gap"></div><p style="margin:0">Total Rp 170.000</p><div class="tail"></div><p style="margin:0">Last line here</p></div>
<div class="bar"><span>Total Rp 170.000</span> <button>Confirm booking</button></div></div>`;

const tellsStyle = `<style>
body{margin:0;font:16px/1.5 sans-serif;background:#05060a;color:#eee}.mono{font-family:Menlo,monospace}
.glow{box-shadow:0 0 24px rgba(168,85,247,.7)}.glass{backdrop-filter:blur(12px)}
.wash{height:240px;background:linear-gradient(135deg,#3b82f6,#a855f7)}.pill{display:inline-block;border-radius:999px;padding:4px 12px;background:#222}
.card{border:1px solid #333;border-radius:12px;padding:16px;min-height:80px}.cta{background:#39ff14;color:#000;padding:12px 20px;display:inline-block}
h1{font-size:48px;margin:8px 0}h1 em{font-family:Georgia,serif;font-style:italic}</style>`;

/** Every visual tell at once. */
export const SLOP = `${head}${tellsStyle}<div class="wash"><span class="pill">AI-powered writing</span><h1>Write <em>faster</em> today</h1>
<a class="cta glow" href="#">Start free</a> <span class="glow">one</span> <span class="glow">two</span></div>
<nav class="glass">a</nav><div class="glass">b</div><div class="glass">c</div>
<p class="mono">Built for teams who ship.</p><p class="mono">Every word in its place.</p><p class="mono">Write once, publish anywhere.</p>
<section class="card"><div class="card">Plan one</div><div class="card">Plan two</div></section>`;

/** One reasoned use of each, which stays quiet. */
export const QUIET = `${head}${tellsStyle}<style>body{background:#fafafa;color:#111}</style><span class="pill">Beta</span><h1>Write faster today</h1><a class="cta glow" href="#">Start free</a>
<nav class="glass">a</nav><p>Run <code class="mono">npx ryux scan</code> to check.</p>
<section class="card"><div class="card">One framed shot</div></section>`;

/** The rest of the branches: small text grouped by size, contrast grouped by colours (alpha and layered
 *  backgrounds), crowded and spaced targets, a sticky header over text, textareas that grow and do not, a
 *  region marked data-ryux-ignore, and long text the messages shorten. */
export const MORE = `${head}<style>
body{margin:0;font:16px/1.4 sans-serif;color:#222;background:#fff}header{position:sticky;top:0;background:#fff;height:40px}
.tiny{font-size:10px}.tinier{font-size:9.5px}.faint{color:rgba(0,0,0,.3)}.tint{background:rgba(0,0,255,.1)}.tint p{color:#99a}
.row a{display:inline-block;width:18px;height:18px;margin-right:30px}.tight a{display:inline-block;width:18px;height:18px;margin:0}
textarea{width:200px;height:40px;font:14px/20px sans-serif}.grow{field-sizing:content}.big{font-size:20px;font-weight:700;color:#999}
.stack{position:relative;height:30px}.stack i{position:absolute;left:0;top:0}</style>
<header><span>Pesanan</span></header>
<p class="tiny">Syarat berlaku untuk semua pesanan</p><p class="tiny">Harga sudah termasuk pajak</p><p class="tinier">v2</p>
<p class="faint">Teks pudar satu</p><p class="faint">Teks pudar dua</p>
<div class="tint"><p>Teks di atas latar berlapis yang sangat panjang sekali sampai harus dipotong di pesan</p></div>
<p class="big">Judul besar abu-abu</p>
<div class="row"><a href="#a" aria-label="satu">1</a><a href="#b" aria-label="dua">2</a></div>
<div class="tight"><a href="#c">x</a><a href="#d">y</a></div>
<label for="n1">Catatan</label><textarea id="n1"></textarea>
<textarea class="grow" aria-label="Catatan tumbuh"></textarea><textarea readonly>tetap</textarea>
<div class="stack"><b>Ringkasan pesanan</b><i>Ringkasan pesanan</i></div>
<div data-ryux-ignore class="panel"><p style="color:#ddd">panel skenario</p><button style="width:10px;height:10px"></button></div>
<div style="height:1200px"></div>`;

/** A desktop checkout: the pay button carries the total in a sticky side column; the only choice on the page (the
 *  payment method) starts below the first screen when `low`, and above the button's row when not. */
export const choice = (low) => `${head}<style>
body{margin:0;font:16px/1.5 sans-serif;color:#111;background:#fff}.wrap{display:flex;gap:32px;padding:24px;align-items:flex-start}
.main{flex:1}.items{height:${low ? 1000 : 120}px;border:1px solid #ddd}aside{position:sticky;top:24px;width:320px}
aside button{width:100%;padding:12px;font:inherit}label{display:block;padding:8px 0}</style>
<div class="wrap"><div class="main"><h1>Checkout</h1><div class="items">Pesanan</div>
<fieldset><legend>Metode pembayaran</legend>
<label><input type="radio" name="pay" value="qris"> QRIS</label><label><input type="radio" name="pay" value="va"> Virtual account BCA</label>
<label><input type="radio" name="pay" value="ew"> E-wallet</label></fieldset></div>
<aside><p>Total Rp1.424.000</p><button>Bayar Rp1.424.000</button></aside></div>`;

/** The A2 shape: the payment card's heading (an h2, not a legend) and a group split into sub-fieldsets by kind. With
 *  `inView` the heading sits on the first screen at 1280x900 and the first option just below it; without, both are
 *  below. */
/** A page with no background under color-scheme: dark, so the browser's dark canvas is behind its light text. */
export const DARK_CANVAS = `${head}<meta name="color-scheme" content="dark"><style>body{margin:0;font:16px sans-serif;color:#eee}</style><p>Bayar sekarang</p>`;
/** Dark text in a wrapper faded to 25%: grey on white as it shows. */
export const FADED = `${head}<style>body{margin:0;font:16px sans-serif;background:#fff;color:#000}.soon{opacity:.25}</style><div class="soon"><p>Segera hadir</p></div><p>Bayar sekarang</p>`;

export const choiceSplit = (inView) => `${head}<style>
body{margin:0;font:16px/1.5 sans-serif;color:#111;background:#fff}.wrap{display:flex;gap:32px;padding:24px;align-items:flex-start}
.main{flex:1}.items{height:${inView ? 700 : 1000}px;border:1px solid #ddd}aside{position:sticky;top:24px;width:320px}
aside button{width:100%;padding:12px;font:inherit}label{display:block;padding:8px 0}.gap{height:60px}</style>
<div class="wrap"><div class="main"><h1>Checkout</h1><div class="items">Pesanan</div>
<section><h2>Metode Pembayaran</h2><div class="gap"></div><div>
<fieldset><legend>QRIS</legend><label><input type="radio" name="pay" value="qris" checked> QRIS</label></fieldset>
<fieldset><legend>Virtual account</legend><label><input type="radio" name="pay" value="bca"> BCA</label>
<label><input type="radio" name="pay" value="bni"> BNI</label></fieldset></div></section></div>
<aside><p>Total Rp1.421.000</p><button>Bayar Rp1.421.000</button></aside></div>`;

/** Text over pictures: white over a gradient that starts in yellow, under the text (fails), over a dark one (passes), over a light
 *  image (fails), under a blend mode (not measured), and a highlighted phrase that wraps inside a dark heading
 *  (passes: only what is behind its own lines counts, not the heading's other words), and a band the page redraws
 *  once while it is measured (found again and measured, not skipped). */
export const BEHIND = `${head}<style>
body{margin:0;font:16px sans-serif;background:#fff;color:#111}.band{padding:16px}
.sunset{background:linear-gradient(90deg,#fde047,#1e3a8a);color:#fff}.night{background:linear-gradient(90deg,#0f172a,#334155);color:#fff}
.photo{background:#000 url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='10' height='10' fill='%23f5f5f4'/></svg>") center/cover;color:#fff}
.mix{mix-blend-mode:difference;color:#fff}.mark{background:#faf5ec;color:#1e2a20;font-size:40px;margin:0;padding:16px}
.mark em{font-style:normal;color:#2e6b3e;background:linear-gradient(transparent 62%,#f6d9c8 62%)}</style>
<div class="band sunset"><p>Promo akhir tahun</p></div><div class="band night"><p>Tetap terbaca</p></div>
<div class="band photo"><p>Foto terang di belakang</p></div><div class="band"><p class="mix">Teks berbaur</p></div>
<h1 class="mark">Tahu dari ladang mana <em>makanan si kecil</em> datang.</h1>
<div class="band sunset" id="redraw"><p>Digambar ulang</p></div>
<script>let n=0;new MutationObserver(()=>{if(n++)return;document.getElementById("redraw").innerHTML="<p>Digambar ulang</p>"}).observe(document.head,{childList:true})</script>`;

/** Every page with the widths the tests render it at. */
export const PAGES = [
  { name: "basics", html: BASICS, widths: [320] },
  { name: "bar-0", html: bar(0), widths: [390] },
  { name: "bar-96", html: bar(96), widths: [390] },
  { name: "slop", html: SLOP, widths: [390, 1280] },
  { name: "quiet", html: QUIET, widths: [390, 1280] },
  { name: "more", html: MORE, widths: [320, 1280] },
  { name: "choice-low", html: choice(true), widths: [390, 1280] },
  { name: "choice-high", html: choice(false), widths: [1280] },
  { name: "choice-split-in-view", html: choiceSplit(true), widths: [1280] },
  { name: "choice-split-low", html: choiceSplit(false), widths: [1280] },
  { name: "dark-canvas", html: DARK_CANVAS, widths: [390] },
  { name: "faded", html: FADED, widths: [390] },
  { name: "behind", html: BEHIND, widths: [390] },
];
