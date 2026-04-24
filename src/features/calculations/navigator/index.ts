let OSName = "unknown";

const userAgent = window.navigator.userAgent;

if (userAgent.indexOf("Windows") != -1) OSName = "windows";
if (userAgent.indexOf("Mac") != -1) OSName = "mac";
if (userAgent.indexOf("X11") != -1) OSName = "unix";
if (userAgent.indexOf("Linux") != -1) OSName = "linux";
if (userAgent.indexOf("Android") != -1) OSName = "android";

document.body.classList.add(`_os-${OSName}`);
