document.addEventListener('DOMContentLoaded', function() {
    const popup = document.querySelector('.cert_popup');
    const popupCheckout = document.querySelector('.cert_popup_checkout');
    const popupSuccess = document.querySelector('.cert_popup_success');
    const popupBalance = document.querySelector('.cert_popup_balance');
    const overlay = document.querySelector('.cert_overlay');
    const closeBtn = document.querySelector('.close_cert_popup');
    const closeBtnCheckout = document.querySelector('.cert_popup_checkout .close_cert_popup');
    const closeBtnSuccess = document.querySelector('.cert_popup_success .close_cert_popup');
    const closeBtnBalance = document.querySelector('.cert_popup_balance .close_cert_popup');
    const buyBtns = document.querySelectorAll('.certs_buy');
    const backCheckout = document.querySelector('#order-certs-prev_step');
    const checkBalance = document.querySelector('#order-certs_step');

    const stepLinks = document.querySelectorAll('#order-certs-next_step, #order-certs-prev_step');
    stepLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    });

    let scrollY = 0;

    function ensureOpenState() {
      if (!overlay.classList.contains('active')) {
        scrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflowY = 'hidden';
        document.body.style.width = '100%';
        overlay.classList.add('active');
      }
    }

    function openPopup() {
      ensureOpenState();
      popup.classList.add('active');
    }

    function closePopup() {
        overlay.classList.remove('active');
        popup.classList.remove('active');
        popupCheckout.classList.remove('active');
        popupSuccess.classList.remove('active');
        popupBalance.classList.remove('active');

        const y = Math.abs(parseInt(document.body.style.top || '0')) || 0;

        const html = document.documentElement;
        const prevScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        document.body.style.width = '';

        requestAnimationFrame(() => {
            window.scrollTo(0, y);
            setTimeout(() => {
            html.style.scrollBehavior = prevScrollBehavior;
            }, 0);
        });
    }

    buyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openPopup();
        });
    });

    checkBalance.addEventListener('click', (e) => {
        e.preventDefault();
        popup.classList.remove('active');
        popupBalance.classList.add('active');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closePopup();
        });
    }

    if (closeBtnCheckout) {
        closeBtnCheckout.addEventListener('click', () => {
            closePopup();
        });
    }

    if (closeBtnSuccess) {
        closeBtnSuccess.addEventListener('click', () => {
            closePopup();
        });
    }

    if (closeBtnBalance) {
        closeBtnBalance.addEventListener('click', () => {
            closePopup();
        });
    }

    if (backCheckout) {
      backCheckout.addEventListener('click', (e) => {
        e.preventDefault();
        ensureOpenState();
        popupCheckout?.classList.remove('active');
        popup?.classList.add('active');
        overlay?.classList.add('active');
      });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closePopup();
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.querySelector('.cert_overlay');
  const popupStart = document.querySelector('.cert_popup');
  const popupCheckout = document.querySelector('.cert_popup_checkout');
  const nextBtn = document.getElementById('order-certs-next_step');
  const amountInput = document.querySelector('#cert_amount[name="cert_amount"]') || document.getElementById('cert_amount');

  function showError(msg) {
    amountInput.classList.add('input-error');
    amountInput.setAttribute('aria-invalid', 'true');

    let err = amountInput.parentElement.querySelector('.cert_error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'cert_error';
      amountInput.insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
  }

  function clearError() {
    amountInput.classList.remove('input-error');
    amountInput.removeAttribute('aria-invalid');
    const err = amountInput.parentElement.querySelector('.cert_error');
    if (err) err.remove();
  }

  function isFilled() {
    const v = String(amountInput.value).trim();
    return v !== '';
  }

  nextBtn?.addEventListener('click', function (e) {
    e.preventDefault();
    let inputElement = document.getElementById('cert_amount');
    let inputValue = parseFloat(inputElement.value.trim());

    if (!amountInput) return;

    if (isFilled()) {
      if (isNaN(inputValue) || inputValue < minAmount) {
          showError('Введите сумму не менее ' + minAmount + ' руб');
          amountInput.focus();
      } else {
          clearError();
          popupStart?.classList.remove('active');
          popupCheckout?.classList.add('active');
          overlay?.classList.add('active');
      }
    } else {
      showError('Введите сумму сертификата');
      amountInput.focus();
    }


    let infoCertAmount = document.querySelector('.info-cert-amount');
    let infoCertsTotal = document.querySelector('.info-certs-total');
    let inputCertsTotal = document.querySelector('#input-certs-total');
    let certAmountInput = document.querySelector('#cert_amount');

    if (infoCertAmount) {
        let totalAmount = parseFloat(certAmountInput.value) || 0;
        
        infoCertAmount.innerHTML = `Подарочный сертификат <span class="dots"></span> ${totalAmount} ₽`;
        infoCertsTotal.innerHTML = `Итого <span class="dots"></span> ${totalAmount} ₽`;
        inputCertsTotal.value = `${totalAmount}`;
    }
    
  });

  amountInput?.addEventListener('input', clearError);
});


document.addEventListener('DOMContentLoaded', function () {
  const phoneInput = document.getElementById('client-phone_cert');

  if (!phoneInput) return;

  phoneInput.addEventListener('focus', function () {
    if (phoneInput.value.trim() === '') {
      phoneInput.value = '+7';
    }
  });

  phoneInput.addEventListener('input', function () {
    let value = phoneInput.value.replace(/[^\d+]/g, '');
    
    if (!value.startsWith('+7')) {
      value = '+7' + value.replace(/^\+?7?/, '');
    }

    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    phoneInput.value = value;
  });

  phoneInput.addEventListener('keydown', function (e) {
    if (
      (phoneInput.selectionStart <= 2 && e.key === 'Backspace') || 
      (phoneInput.selectionStart <= 2 && e.key === 'Delete')
    ) {
      e.preventDefault();
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('client-email_cert');
  const nameInput = document.getElementById('client-name_cert');
  const surnameInput = document.getElementById('client-surname_cert');
  const phoneInput = document.getElementById('client-phone_cert');
  const submitBtn = document.getElementById('submit-order-gift');
  const agreeCheckbox = document.getElementById('cert_checkout_agree');

  if (!emailInput || !submitBtn || !agreeCheckbox) return;

  function showInputError(input, msg) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');

    input.closest('.field')?.classList.add('has-error');

    let err = input.parentElement.querySelector('.cert_error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'cert_error';
      err.style.marginBottom = '4px';
      input.insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
  }

  function clearInputError(input) {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    input.closest('.field')?.classList.remove('has-error');
    const err = input.parentElement.querySelector('.cert_error');
    if (err) err.remove();
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function getPhoneDigits(raw) {
    return (raw || '').replace(/\D/g, '');
  }
  function isPhoneEmptyOrMaskOnly(raw) {
    const d = getPhoneDigits(raw);
    return d.length <= 1;
  }
  function isValidPhone(raw) {
    const d = getPhoneDigits(raw);
    return d.length === 11 && d.startsWith('7');
  }  

  submitBtn.addEventListener('click', function (e) {
    e.preventDefault();

    [emailInput, nameInput, surnameInput, phoneInput].forEach(clearInputError);

    if (nameInput.value.trim() === '') {
      showInputError(nameInput, 'Введите имя');
      nameInput.focus();
      return;
    }

    if (surnameInput.value.trim() === '') {
      showInputError(surnameInput, 'Введите фамилию');
      surnameInput.focus();
      return;
    }

    if (isPhoneEmptyOrMaskOnly(phoneInput.value)) {
      showInputError(phoneInput, 'Введите номер телефона');
      phoneInput.focus();
      return;
    }

    if (!isValidPhone(phoneInput.value)) {
      showInputError(phoneInput, 'Введите номер формата +7(999)999-99-99');
      phoneInput.focus();
      return;
    }

    const emailValue = emailInput.value.trim();
    if (emailValue === '') {
      showInputError(emailInput, 'Введите адрес электронной почты');
      emailInput.focus();
      return;
    }
    if (!isValidEmail(emailValue)) {
      showInputError(emailInput, 'Введите корректный адрес (например, email@example.com)');
      emailInput.focus();
      return;
    }

    if (!agreeCheckbox.checked) {
      alert('Пожалуйста, подтвердите согласие перед оформлением заказа.');
      return;
    }
    
    var errors = [];

    $('#loader-order-certs').css('background', 'rgba(26, 26, 26, 0.25)');
    $('#loader-order-certs').css('display', 'flex');

    if (errors.length > 0) {
        e.preventDefault();
        $('#loader-order-certs').hide();
        var errorList = '<ul class="t-form__errorbox-text t-text t-text_md">';
        $.each(errors, function(index, error) {
            errorList += '<li class="t-form__errorbox-item js-rule-error" style="display:block;">' + error + '</li>';
        });
        errorList += '</ul>';
        $('#form-messages_cert').html('<div class="error-message">' + errorList + '</div>').fadeIn();
        return;
    }

    if (errors.length > 0) {
        e.preventDefault();
        $('#loader-order-certs').hide();
        $('#form-messages_cert').html('<div class="error-message">' + errors.join('<br>') + '</div>').fadeIn();
        return;
    }

    function generateOrderNumber() {
      const now = new Date();
      const timestamp = now.getFullYear().toString() + 
                        (now.getMonth() + 1).toString().padStart(2, '0') + 
                        now.getDate().toString().padStart(2, '0') + 
                        now.getHours().toString().padStart(2, '0') + 
                        now.getMinutes().toString().padStart(2, '0') + 
                        now.getSeconds().toString().padStart(2, '0') + 
                        now.getMilliseconds().toString().padStart(3, '0');

      const randomPart = Math.random().toString(36).substring(2, 10);

      return timestamp + randomPart;
    }

    function generateCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 10; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    let orderNumber = generateOrderNumber();
    const inputElement = document.getElementById('order-number-cert');
    inputElement.value = orderNumber;

    let surname = $('input[name="client-surname_cert"]').val().trim();
    let name = $('input[name="client-name_cert"]').val().trim();
    let phone = $('input[name="phone_cert"]').val().trim();
    let email = $('input[name="email_cert"]').val().trim();
    let amount = $('input[name="total_cert"]').val();

    var formData = new FormData();
    formData.append('action', 'order_gift_certificate');
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('amount', amount);
    formData.append('code', generateCode());
    formData.append('order_number', orderNumber);
    
    $.ajax({
        url: '/api/handler',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            // $('#loader-order-certs').hide();
            if (response.success) {
                $('#order-certs-form').off('submit').submit();
            } else {
                $('#loader-order-certs').hide();
                $('#form-messages_cert').html('<div class="error-message">Ошибка: ' + response.data + '</div>').fadeIn();
            }
        },
        error: function() {
            $('#loader-order-certs').hide();
            $('#form-messages_cert').html('<div class="error-message">Ошибка при отправке формы.</div>').fadeIn();
        }
    });
  });

  [emailInput, nameInput, surnameInput, phoneInput].forEach(input => {
    input.addEventListener('input', (e) => {
      if (input.classList.contains('input-error')) {
        clearInputError(input);
      }
    });
  });

  function updateSubmitState() {
    if (agreeCheckbox.checked) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.filter = 'grayscale(0)';
    } else {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.filter = 'grayscale(100%)';
    }
  }

  updateSubmitState();
  agreeCheckbox.addEventListener('change', updateSubmitState);
});


document.addEventListener('DOMContentLoaded', function () {
  const overlayEvent = document.querySelector('.event_overlay');
  const popupEvent   = document.querySelector('.event_popup');
  const popupEventSuccess   = document.querySelector('.event_success_popup');
  const openBtnEvent = document.querySelectorAll('.order_event');
  const openBtnEventSuccess = document.getElementById('submitButton');
  const closeBtnEvent = document.querySelector('.close_event_popup');
  const closeBtnEventSuccess = document.querySelector('#close_event_popup_success');

  if (!overlayEvent || !popupEvent || !popupEventSuccess || !openBtnEvent) return;

  let scrollYEvent = 0;

  function lockBody() {
    scrollYEvent = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYEvent}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflowY = 'hidden';
    document.body.style.width = '100%';
  }
  
  function unlockBody() {
    const y = Math.abs(parseInt(document.body.style.top || '0')) || 0;

    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflowY = '';
    document.body.style.width = '';

    requestAnimationFrame(() => {
        window.scrollTo(0, y);
        setTimeout(() => {
        html.style.scrollBehavior = prevScrollBehavior;
        }, 0);
    });
  }

  function openEventPopup() {
    if (!overlayEvent.classList.contains('active')) {
      lockBody();
      overlayEvent.classList.add('active');
    }
    popupEvent.classList.add('active');
  }

  function closeEventPopup() {
    popupEvent.classList.remove('active');
    popupEventSuccess.classList.remove('active');
    overlayEvent.classList.remove('active');
    unlockBody();
  }

  openBtnEvent.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openEventPopup();
    });
  });

//   openBtnEventSuccess.addEventListener('click', function (e) {
//     e.preventDefault();
//     popupEventSuccess.classList.add('active');
//     popupEvent.classList.remove('active');
//   });

  if (closeBtnEvent) {
    closeBtnEvent.addEventListener('click', function (e) {
      e.preventDefault();
      closeEventPopup();
    });
  }

  if (closeBtnEventSuccess) {
    closeBtnEventSuccess.addEventListener('click', function (e) {
      e.preventDefault();
      closeEventPopup();
    });
  }

  overlayEvent.addEventListener('click', function (e) {
    if (e.target === overlayEvent) {
      closeEventPopup();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlayEvent.classList.contains('active')) {
      closeEventPopup();
    }
  });
});