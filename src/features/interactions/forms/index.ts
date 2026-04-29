import { installClass } from "@/app/App.js";
import Form from "@/shared/lib/ui-classes/Form";

installClass(".js-form", Form, {
  onSuccess(form) {
    const errorElem = form.querySelector(".form-error");
    errorElem && errorElem.remove();
  },
  onError(form, message) {
    let errorElem = form.querySelector(".form-error");

    if (!errorElem) {
      errorElem = document.createElement("div");
      errorElem.className = "form-error";
      form.append(errorElem);
    }

    errorElem.innerHTML = message;

    // * снимаем все _success-классы с полей
    form.querySelectorAll(".field._success").forEach((el) => {
      el.classList.remove("_success");
    });
  },
});
