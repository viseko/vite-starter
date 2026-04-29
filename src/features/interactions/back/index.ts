import { install } from "@/app/App";

install(".js-back", (btn) => {
  btn.addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = "/";
    }
  });
});
