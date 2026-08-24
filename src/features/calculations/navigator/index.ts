let OSName = "unknown";

const userAgent = window.navigator.userAgent;

if (userAgent.includes("Windows")) OSName = "windows";
if (userAgent.includes("Mac")) OSName = "mac";
if (userAgent.includes("X11")) OSName = "unix";
if (userAgent.includes("Linux")) OSName = "linux";
if (userAgent.includes("Android")) OSName = "android";

document.body.classList.add(`_os-${OSName}`);
