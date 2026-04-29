type Options = {
  errorClass?: string;
  successClass?: string;
  awaitClass?: string;
  resetAfterSuccess?: boolean;
  resetDelay?: number;
  onError?: () => void;
  onSubmit?: () => void;
  onSuccess?: () => void;
};

type FieldData = {
  name: string;
};

export default class Form {
  errorClass: string;
  successClass: string;
  awaitClass: string;
  resetAfterSuccess: boolean;
  resetDelay: number;
  onError?: () => void;
  onSubmit?: () => void;
  onSuccess?: () => void;
  form: HTMLFormElement;
  redirect?: string;
  noReset: boolean;
  fields: FieldData[];
  submitButton: HTMLButtonElement | null;

  constructor(formElement: HTMLFormElement, options: Options) {
    (this.errorClass = options.errorClass || "_error"),
      (this.successClass = options.successClass || "_success"),
      (this.awaitClass = options.awaitClass || "_await"),
      (this.resetAfterSuccess = options.resetAfterSuccess || true),
      (this.resetDelay = options.resetDelay || 10000),
      (this.onError = options.onError);
    this.onSubmit = options.onSubmit;
    this.onSuccess = options.onSuccess;

    this.form = formElement;
    this.redirect = formElement.dataset.redirect;

    const dataReset = formElement.dataset.reset;
    this.noReset = dataReset === "false";

    const fieldNames = [...formElement.querySelectorAll("[name]")];
    this.fields = [];

    if (fieldNames.length && formElement.inputFields) {
      this.fields = fieldNames
        .map((field) => {
          const name = field.name;
          return formElement.inputFields[name];
        })
        .filter(Boolean);
    }

    this.form.addEventListener("submit", (event) => {
      this.submitHandler(event);
    });

    this.submitButton = formElement.querySelector("[type='submit']");
    this.submitButton &&
      this.submitButton.addEventListener("click", (event) => {
        this.submitButtonHandler(event);
      });

    // Приделываем инстанс к DOM-объекту
    formElement.Form = this;
  }

  submitHandler(event) {
    event.preventDefault();
    this.send();
  }

  submitButtonHandler(event) {
    const isValid = this.validate();

    if (isValid) {
      return true;
    } else {
      event.preventDefault();
    }
  }

  // Валидация формы
  validate() {
    const fields = this.fields;

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      field?.validate();

      if (field.valid === false) return false;
    }

    return true;
  }

  // Отправка формы
  send() {
    this.setLock(true);
    this.onSubmit && this.onSubmit(this.form);

    const form = this.form;
    const url = form.action;
    const formData = new FormData(form);

    // * Добавляем sessid
    let sessid = null;
    if (typeof BX !== "undefined" && typeof BX.bitrix_sessid === "function") {
      sessid = BX.bitrix_sessid();
    }
    if (sessid) {
      formData.append("sessid", sessid);
    }

    // * Добавляем form_placement
    // const button = event?.submitter || this.submitButton;
    // const getFormPlacement = (submitButton) => {
    //   if (!submitButton) return "unknown";
    //   if (submitButton.closest("header.page-header")) return "header";
    //   if (submitButton.closest("header.page-title")) return "slider";
    //   if (submitButton.closest("footer")) return "footer";
    //   const closestSection = submitButton.closest(".page-section");
    //   if (closestSection) return closestSection.id || "section";
    //   return "other";
    // };
    // const formPlacement = getFormPlacement(button);
    // formData.append("form_placement", formPlacement);

    // * Добавляем url (если нужно отправлять как поле, а не просто fetch)
    formData.append("url", window.location.href);

    // Преобразуем FormData → URLSearchParams
    const body = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      body.append(key, value);
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })
      .then((response) => {
        const contentType = response.headers.get("Content-Type");
        const isJson = contentType && contentType.includes("application/json");
        return Promise.all([response.status, isJson ? response.json() : response.text()]);
      })
      .then(([responseStatus, data]) => {
        const { status, message, errors, reload, redirect } = data;

        if (status && status === "error") {
          // * вывод текста общей ошибки
          if (message) {
            this.handleError(message);
          }

          // * вывод ошибок полей
          if (errors) {
            const errosList = errors.map ? errors : Object.entries(errors); // пришёл массив или объект?
            errosList.forEach(([fieldName, msg]) => {
              const input = form.querySelector(`[name='${fieldName}']`);
              if (!input) return;

              const field = input.closest(".field")?.FieldText;
              field && field.setInvalid(msg);
            });
          }
        } else if (responseStatus === 200) {
          this.handleSuccess(data);
        } else {
          const errorMessage =
            typeof data === "object" && data.MESSAGE
              ? data.MESSAGE
              : data || "Ошибка обработки ответа сервера";
          this.handleError(errorMessage);
        }

        if (reload) {
          location.reload();
        }

        if (redirect) {
          window.location.href = redirect;
        }
      })
      .catch((err) => this.handleError(err.message))
      .finally(() => this.setLock(false));
  }

  // Включене/отключение режима ожидания
  // * блокировка кнопки и полей ввода
  // * навешивание css-класса ожидания
  setLock(bool) {
    this.submitButton && (this.submitButton.disabled = bool);
    this.fields.forEach((field) => {
      field.disabled = bool;
    });
    this.form.classList[bool ? "add" : "remove"](this.awaitClass);
  }

  // Очистка формы
  reset() {
    this.form.reset();
    this.form.querySelectorAll("._success").forEach((elem) => elem.classList.remove("_success"));
  }

  // Обработка успешной отправки
  handleSuccess(data) {
    if (!this.noReset) {
      this.reset();
    }

    this.form.classList.add(this.successClass);
    this.onSuccess && this.onSuccess(this.form, data);

    // Редирект если указан
    if (this.redirect) {
      window.location.href = this.redirect;
      return; // дальше таймеры и классы уже не нужны
    }

    if (this.resetAfterSuccess && this.resetDelay) {
      setTimeout(() => {
        this.form.classList.remove(this.successClass);
      }, this.resetDelay);
    }
  }

  // Обработка ошибки
  handleError(message) {
    this.form.classList.add(this.errorClass);
    this.onError && this.onError(this.form, message);
  }
}
