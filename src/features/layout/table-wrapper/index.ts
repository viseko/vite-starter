const tables = document.querySelectorAll(".content table");
const wrapperClass = "table-wrapper";

tables.forEach((table) => {
  let wrapper = table.closest(`.${wrapperClass}`);
  if (!wrapper) return;

  wrapper = document.createElement("div");
  wrapper.className = wrapperClass;
  table.parentNode?.insertBefore(wrapper, table);
  wrapper.append(table);
});
