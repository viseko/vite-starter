// import tippy from "tippy.js";
// import { install } from "@/app/App";

// install("[data-tooltip]", (elem) => {
//   // Создаем экземпляр Tippy
//   const instance = tippy(elem, {
//     content: elem.dataset.tooltip || "",
//     allowHTML: true,
//     placement: "top",
//     trigger: "mouseenter focus", // Показывать при наведении или фокусе
//     hideOnClick: false, // Не скрывать при клике
//     interactive: true, // Разрешить взаимодействие с подсказкой
//   });

//   // Настраиваем MutationObserver для отслеживания изменений data-tooltip
//   const observer = new MutationObserver(() => {
//     // Обновляем содержимое подсказки
//     instance.setContent(elem.dataset.tooltip || "");
//     // Если подсказка видима, обновляем её без скрытия
//     if (instance.state.isVisible) {
//       instance.popperInstance?.update(); // Обновляем позицию и содержимое
//     }
//   });

//   // Наблюдаем за изменениями атрибута data-tooltip
//   observer.observe(elem, {
//     attributes: true,
//     attributeFilter: ["data-tooltip"],
//   });

//   // Возвращаем функцию для очистки
//   return () => {
//     instance.destroy();
//     observer.disconnect();
//   };
// });
