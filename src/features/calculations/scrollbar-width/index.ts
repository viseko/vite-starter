const el = document.createElement("div");
el.style.cssText =
  "width:100px;height:100px;overflow:scroll;visibility:hidden;position:absolute;top:-9999px;";
document.body.appendChild(el);
const width = el.offsetWidth - el.clientWidth;
el.remove();

document.body.style.setProperty("--scrollbar-width", `${width}px`);
