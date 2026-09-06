jQuery(document).ready(function($) {
    $('#order-event-form').on('submit', function (e) {
        e.preventDefault();
        var errors = [];
    
        $('#loader-order').css('display','flex');
    
        var surname = $('input[name="client-surname"]').val().trim();
        var name = $('input[name="client-name"]').val().trim();
        var phone = $('input[name="phone"]').val().trim();
        var email = $('input[name="email"]').val().trim();
        var isConfirmed = $('input[name="confirm_agree"]').is(':checked');
    
        if (!name) {
            errors.push('Поле "Имя" должно быть заполнено.');
        }
        if (!surname) {
            errors.push('Поле "Фамилия" должно быть заполнено.');
        }
        if (!phone) {
            errors.push('Поле "Номер телефона" должно быть заполнено.');
        }
        if (!email) {
            errors.push('Поле "Электронная почта" должно быть заполнено.');
        }
        if (!isConfirmed) {
            errors.push('Необходимо подтвердить согласие.');
        }
    
        if (errors.length > 0) {
            $('#loader-order').hide();
            var errorList = '<ul class="t-form__errorbox-text t-text t-text_md">';
            $.each(errors, function (index, error) {
                errorList += '<li class="t-form__errorbox-item js-rule-error" style="display:block;">' + error + '</li>';
            });
            errorList += '</ul>';
            $('#form-messages').html('<div class="error-message">' + errorList + '</div>').fadeIn();
            return;
        }
    
        // var dataIds = $('#data-ids').val().trim();
        var dataIds = window.OrderData.seatIds;
        if (!window.OrderData.seatIds.length) {
            errors.push('Не выбрано ни одно место.');
        } else {
            // var seatNumbers = dataIds.split(',').map(function (seat) {
            //     return 'seat_' + seat.replace(/\D/g, '');
            // });
            var seatNumbers = window.OrderData.seatIds.map(id => "seat_" + id.replace(/\D/g, ""));
        }
    
        if (errors.length > 0) {
            $('#loader-order').hide();
            $('#form-messages').html('<div class="error-message">' + errors.join('<br>') + '</div>').fadeIn();
            return;
        }
    
        // let orderNumber = generateOrderNumber();
        // const inputElement = document.getElementById('order-number');
        // inputElement.value = orderNumber;
    
        $.ajax({
            url: '/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
                action: 'check_seat_availability',
                seatNumbers: seatNumbers,
                eventId: $('#event-id').val()
            },
            success: function (response) {
                if (response.success) {
                    const giftCode = $('#gift-code').val();
                    // const amountSale = $('#amount-sale').val();
                    // const inputTotal = $('#input-total').val();
                    const amountSale = window.OrderData.amountSale;
                    const inputTotal = window.OrderData.total;

                    const orderForm = document.getElementById('order-event-form');
                    function injectHidden(name, value) {
                        let el = document.createElement('input');
                        el.type = 'hidden';
                        el.name = name;
                        el.value = value;
                        orderForm.appendChild(el);
                    }

                    window.OrderData.orderNumber = generateOrderNumber();

                    injectHidden('orderNumber', window.OrderData.orderNumber);
                    injectHidden('total', window.OrderData.total);
                    injectHidden('tickets-count', window.OrderData.ticketsCount);
                    injectHidden('seat-number', window.OrderData.seatNumbers.join(','));
                    injectHidden('data-ids', window.OrderData.seatIds.join(','));
                    injectHidden('amount-sale', window.OrderData.amountSale);
    
                    if (giftCode && amountSale) {
                        $.ajax({
                            url: '/wp-admin/admin-ajax.php',
                            type: 'POST',
                            data: {
                                action: 'update_gift_code_usage',
                                // orderNumber: orderNumber,
                                orderNumber: window.OrderData.orderNumber,
                                gift_code: giftCode,
                                amount_sale: amountSale
                            },
                            success: function (giftResponse) {
                                if (giftResponse.new_balance !== undefined) {
                                    var formData = new FormData($('#order-event-form')[0]);
                                    formData.append('action', 'order_seat');
                                    formData.append('id', $('#event-id').val());
    
                                    $.ajax({
                                        url: '/wp-admin/admin-ajax.php',
                                        type: 'POST',
                                        data: formData,
                                        processData: false,
                                        contentType: false,
                                        success: function (response) {
                                            if (response.success) {
                                                // $('#loader-order').hide();
                                                if (inputTotal == 0) {
                                                    $.ajax({
                                                        url: '/wp-admin/admin-ajax.php',
                                                        type: 'POST',
                                                        data: {
                                                            action: 'use_full_discount',
                                                            orderNumber: window.OrderData.orderNumber,
                                                            amountSale: amountSale,
                                                            gift_code: giftCode
                                                        },
                                                        success: function (responseUse) {
                                                            // window.location.href = '/success-full';
                                                            window.location.href = `/success-full/?orderNumber=${encodeURIComponent(window.OrderData.orderNumber)}`;
                                                        },
                                                        error: function () {
                                                            $('#loader-order').hide();
                                                            $('#form-messages').html('<div class="error-message">Ошибка при отправке формы.</div>').fadeIn();
                                                        }
                                                    });
                                                } else {
                                                    $('#order-event-form').off('submit').submit();
                                                }
                                            } else {
                                                $('#loader-order').hide();
                                                $('#form-messages').html('<div class="error-message">Ошибка: ' + response.data + '</div>').fadeIn();
                                            }
                                        },
                                        error: function () {
                                            $('#loader-order').hide();
                                            $('#form-messages').html('<div class="error-message">Ошибка при отправке формы.</div>').fadeIn();
                                        }
                                    });
                                } else {
                                    $('#loader-order').hide();
                                    $('#form-messages').html('<div class="error-message">Ошибка при применении сертификата: ' + giftResponse.message + '</div>').fadeIn();
                                }
                            },
                            error: function () {
                                $('#loader-order').hide();
                                $('#form-messages').html('<div class="error-message">Ошибка при проверке сертификата.</div>').fadeIn();
                            }
                        });
                    } else {
                        var formData = new FormData($('#order-event-form')[0]);
                        formData.append('action', 'order_seat');
                        formData.append('id', $('#event-id').val());
    
                        $.ajax({
                            url: '/wp-admin/admin-ajax.php',
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (response) {
                                if (response.success) {
                                    // $('#loader-order').hide();
                                    $('#order-event-form').off('submit').submit();
                                } else {
                                    $('#loader-order').hide();
                                    $('#form-messages').html('<div class="error-message">Ошибка: ' + response.data + '</div>').fadeIn();
                                }
                            },
                            error: function () {
                                $('#loader-order').hide();
                                $('#form-messages').html('<div class="error-message">Ошибка при отправке формы.</div>').fadeIn();
                            }
                        });
                    }
                } else {
                    $('#loader-order').hide();
                    $('#form-messages').html('<div class="error-message">Ошибка: ' + response.data + '</div>').fadeIn();
                }
            },
            error: function () {
                $('#loader-order').hide();
                $('#form-messages').html('<div class="error-message">Ошибка при проверке доступности мест.</div>').fadeIn();
            }
        });
    });
     


    // $('#refund-form').on('submit', function(e) {
    //     e.preventDefault();
    //     $('#loader-refund').show();
    //     $('#refund-form-messages').hide().html('');
        
    //     var errors = [];
        
    //     if (errors.length > 0) {
    //         $('#loader-refund').hide();
    //         var errorList = '<ul class="t-form__errorbox-text t-text t-text_md">';
    //         $.each(errors, function(index, error) {
    //             errorList += '<li class="t-form__errorbox-item js-rule-error" style="display:block;">' + error + '</li>';
    //         });
    //         errorList += '</ul>';
    //         $('#refund-form-messages').html('<div class="error-message">' + errorList + '</div>').fadeIn();
    //         return;
    //     }
        
    //     var formData = new FormData(this);
    //     formData.append('action', 'refund_order');
        
    //     $.ajax({
    //         url: '/wp-admin/admin-ajax.php',
    //         type: 'POST',
    //         data: formData,
    //         processData: false,
    //         contentType: false,
    //         success: function(response) {
    //             if (response.success) {
    //                 $('#loader-refund').hide();
    //                 $('#refund-form').find('input').hide();
    //                 $('#refund-form').find('input[type="submit"]').hide();
    //                 //$('.refund_modal').hide();
    //                 $('.refund_modal_success').show();
    //                 $('.bg-overflow-refund').show();
    //                 setTimeout(() => {
    //                     window.location.href = "/index";
    //                 }, 4000);
    //             } else {
    //                 $('#loader-refund').hide();
    //                 $('#refund-form-messages').html('<div class="error-message">Ошибка: ' + response.data + '</div>').fadeIn();
    //             }
    //         },
    //         error: function() {
    //             $('#loader-refund').hide();
    //             $('#refund-form-messages').html('<div class="error-message">Ошибка при отправке формы</div>').fadeIn();
    //         }
    //     });
    // });    

    $('#form641584558').on('submit', function(e) {
        e.preventDefault();
        $('#loader-form').show();
    
        $('#form-messages').hide().html('');
    
        var name = $('input[name="Name"]').val().trim();
        var phone = $('input[name="Phone"]').val().trim();
        var comment = $('textarea[name="Textarea"]').val().trim();
        var errors = [];
    
        if (!name) {
            errors.push('Поле "Ваше имя" должно быть заполнено.');
        }
        if (!phone) {
            errors.push('Поле "Ваш телефон" должно быть заполнено.');
        }
        if (!comment) {
            errors.push('Поле "Комментарий" должно быть заполнено.');
        }

        if (errors.length > 0) {
            $('#loader-form').hide();
            var errorList = '<ul class="t-form__errorbox-text t-text t-text_md">';
            $.each(errors, function(index, error) {
                errorList += '<li class="t-form__errorbox-item js-rule-error" style="display:block;">' + error + '</li>';
            });
            errorList += '</ul>';
            $('#form-messages_order_event').html('<div class="error-message">' + errorList + '</div>').fadeIn();
            return;
        } else {
            $('#form-messages_order_event').fadeOut(function() {
                $(this).empty();
            });
        }
    
        var formData = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: '/wp-admin/admin-ajax.php',
            data: formData + '&action=process_contact_form',
            success: function(response) {
                if (response.success) {
                    $('#loader-form').hide();
                    $('.js-successbox')
                        .html('Ваше сообщение успешно отправлено!')
                        .fadeIn();
                    $('#form641584558').find('input, textarea').hide();
                    $('#form641584558')[0].reset();
                    $('#form-messages_order_event').html('').fadeOut();
                } else {
                    $('#loader-form').hide();
                    $('#form-messages').html('<div class="error-message">Ошибка: ' + response.data + '</div>').fadeIn();
                }
            },
            error: function() {
                $('#loader-form').hide();
                $('#form-messages').html('<div class="error-message">Ошибка при отправке запроса.</div>').fadeIn();
            }
        });
    });


    $("#submit-transfer").on("click", function (e) {
        e.preventDefault();
        let orderNumber = $("#order-number_transfer").val();
        $('#loader-refund').show();
        let containerEvents = $("#events-container");
        let containerSeats = $("#seats-container");
        containerEvents.empty();
        containerSeats.empty();


        if (!orderNumber) {
            alert("Введите номер заказа!");
            $('#loader-refund').hide();
            return;
        }
    
        let data = {
            action: "get_events_by_order",
            order_number: orderNumber
        };
    
        $.ajax({
            url: ajaxurl, 
            type: "POST",
            dataType: "json",
            data: data,
            success: function (response) {
                let container = $("#events-container");
                container.empty();
    
                if (!response.success || response.data.length === 0) {
                    let message = response.data.message || "Ошибка получения данных";
                    container.html(`<p>${message}</p>`);
                    $('#loader-refund').hide();
                    return;
                }

                let text = $("<h2>Выберите дату вашего шоу</h2><br>");
                container.append(text);
    
                response.data.forEach(event => {
                    let button = $("<button>")
                        .addClass("button-primary")
                        .addClass("button")
                        .addClass("event_list-button")
                        .addClass("black_button")
                        .attr("id", event.id)
                        .text(event.name)
                        .data("eventId", event.id)
                        .attr("event-id", event.id)
                        .on("click", function () {
                            loadSeats(event.id, orderNumber);
                            document.querySelector('.refund_modal').style = 'display:none;';
                            document.querySelector('.transfer_event').style = 'display:flex;';
                        });
    
                    container.append(button);
                    $('#loader-refund').hide();
                });
            },
            error: function (xhr, status, error) {
                console.error("Ошибка AJAX-запроса:", error);
                alert("Ошибка при выполнении запроса.");
                $('#loader-refund').hide();
            }
        });
    });
    
    function loadSeats(eventId, orderNumber) {
        let data = {
            action: "get_seats_by_event",
            event_id: eventId,
            order_number: orderNumber
        };

        $('#loader-refund').show();

        $.ajax({
            url: ajaxurl,
            type: "POST",
            dataType: "json",
            data: data,
            success: function (response) {
                let container = $("#seats-container");
                container.empty();

                if (!response.success || response.data.length === 0) {
                    alert("Места не найдены.");
                    $('#loader-refund').hide();
                    return;
                }

                let seatGroups = groupSeatsByTable(response.data);

                let text = $("<h2>Выберите места для переноса</h2><br>");
                container.append(text);

                seatGroups.forEach(group => {
                    let seatText = group.seat_numbers.join(", ");
                    let tableButton = $("<button style='margin-bottom:10px;'>")
                        .addClass("button-primary")
                        .addClass("button")
                        .addClass("black_button")
                        .addClass("seat_list_button")
                        .text(seatText)
                        .attr("data-ids", group.data_ids.join(","))
                        .attr("data-seat-numbers", seatText)
                        .attr("event-id-seats", eventId)
                        .attr("data-order-number", orderNumber);

                    container.append(tableButton);
                });

                $('#loader-refund').hide();
            },
            error: function (xhr, status, error) {
                console.error("Ошибка AJAX-запроса:", error);
                alert("Ошибка при выполнении запроса.");
                $('#loader-refund').hide();
            }
        });
    }

    function groupSeatsByTable(seats) {
        let tables = [];

        seats.forEach(seat => {
            let seatNumbers = seat.data_ids.split(",").map(id => parseInt(id.replace("s", "")));
            let tableGroups = {};

            seatNumbers.forEach((seatNumber, index) => {
                let tableNum = getTableNumber(seatNumber);
                if (!tableGroups[tableNum]) {
                    tableGroups[tableNum] = [];
                }
                tableGroups[tableNum].push({
                    seat_number: seat.seat_number.split(",")[index],
                    data_id: seat.data_ids.split(",")[index]
                });
            });

            Object.values(tableGroups).forEach(group => {
                tables.push({
                    seat_numbers: group.map(s => s.seat_number),
                    data_ids: group.map(s => s.data_id)
                });
            });
        });

        return tables;
    }

    function getTableNumber(seatNumber) {
        if (seatNumber >= 1 && seatNumber <= 4) return 1;
        if (seatNumber == 10 || (seatNumber >= 5 && seatNumber <= 9)) return 2;
        if (seatNumber >= 11 && seatNumber <= 14) return 3;
        if (seatNumber >= 15 && seatNumber <= 18) return 4;
        if (seatNumber >= 19 && seatNumber <= 22) return 5;
        if (seatNumber >= 23 && seatNumber <= 26) return 6;
        if (seatNumber >= 27 && seatNumber <= 30) return 7;
        if (seatNumber >= 31 && seatNumber <= 34) return 8;
        if (seatNumber >= 35 && seatNumber <= 38) return 9;
        if (seatNumber >= 39 && seatNumber <= 42) return 10;
        if (seatNumber >= 43 && seatNumber <= 46) return 11;
        if (seatNumber >= 47 && seatNumber <= 50) return 12;
        return Math.ceil((seatNumber - 1) / 4) + 1;
    }
    
});

// const chooseEvent = document.querySelector('#choose-event');
// const refundModal = document.querySelector('.refund_modal');
// const bgOverflowRefund = document.querySelector('.bg-overflow-refund');
// const closeButtonRefund = document.querySelectorAll('.closeModal-button-refund');
// closeButtonRefund.forEach(function(button) {
//     button.addEventListener('click', function() {
//         refundModal.style.display = 'none';
//         bgOverflowRefund.style.display = 'none';
//         document.body.classList.remove('no-scroll');
//     });
// });
// const buttonsCerts = document.querySelectorAll('.refund_button');
// buttonsCerts.forEach(function(button) {
//     button.addEventListener('click', function() {
//         refundModal.style.display = 'block';
//         bgOverflowRefund.style.display = 'block';
//         document.body.classList.add('no-scroll');
//     });
// });

function parseDate(dateString) {
    var parts = dateString.split(', ');
    var datePart = parts[0];
    var timePart = parts[1].split(' ')[1];

    var months = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
        'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
        'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };

    var dateParts = datePart.split(' ');
    var day = parseInt(dateParts[0], 10);
    var month = months[dateParts[1]];

    var currentYear = new Date().getFullYear();

    return new Date(currentYear, month, day, timePart.split(':')[0], timePart.split(':')[1]);
}

document.getElementById('client-name').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^a-zA-ZА-Яа-яЁё\s]/g, '');
});

document.getElementById('client-surname').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^a-zA-ZА-Яа-яЁё\s]/g, '');
});

document.getElementById('client-phone').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^0-9\s\+\(\)-]/g, '');
});
document.getElementById('client-email').addEventListener('input', function (e) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.value)) {
        this.setCustomValidity("Введите корректный email.");
    } else {
        this.setCustomValidity("");
    }
});

const nameInput = document.getElementById('client-name_cert');
const surnameInput = document.getElementById('client-surname_cert');
const phoneInput = document.getElementById('client-phone_cert');
const emailInput = document.getElementById('client-email_cert');

if (nameInput) {
    nameInput.addEventListener('input', function (e) {
        this.value = this.value.replace(/[^a-zA-ZА-Яа-яЁё\s]/g, '');
    });
}

if (surnameInput) {
    surnameInput.addEventListener('input', function (e) {
        this.value = this.value.replace(/[^a-zA-ZА-Яа-яЁё\s]/g, '');
    });
}

if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        this.value = this.value.replace(/[^0-9\s\+\(\)-]/g, '');
    });
}

if (emailInput) {
    emailInput.addEventListener('input', function (e) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(this.value)) {
            this.setCustomValidity("Введите корректный email.");
        } else {
            this.setCustomValidity("");
        }
    });
}

$('#order-certs-form').on('submit', function(e) {
    e.preventDefault();
    var errors = [];

    $('#loader-order-certs').show();
    
    let surname = $('input[name="client-surname_cert"]').val().trim();
    let name = $('input[name="client-name_cert"]').val().trim();
    let phone = $('input[name="phone_cert"]').val().trim();
    let email = $('input[name="email_cert"]').val().trim();
    let amount = $('input[name="total_cert"]').val();
    let isConfirmed = $('input[name="confirm_agree_cert"]').is(':checked');
    
    if (!surname) {
        errors.push('Поле "Фамилия" должно быть заполнено.');
    }
    if (!name) {
        errors.push('Поле "Имя" должно быть заполнено.');
    }
    if (!phone) {
        errors.push('Поле "Номер телефона" должно быть заполнено.');
    }
    if (!email) {
        errors.push('Поле "Электронная почта" должно быть заполнено.');
    }
    if (!isConfirmed) {
        errors.push('Необходимо подтвердить согласие.');
    }

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

    let orderNumber = generateOrderNumber();
    const inputElement = document.getElementById('order-number-cert');
    inputElement.value = orderNumber;

    var formData = new FormData();
    formData.append('action', 'order_gift_certificate');
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('amount', amount);
    formData.append('code', generateCode());
    formData.append('order_number', orderNumber);

    // var formData = {
    //     name: name,
    //     surname: surname,
    //     phone: phone,
    //     email: email,
    //     amount: amount,
    //     code: generateCode(),
    //     order_number: generateOrderNumber()
    // };
    
    $.ajax({
        url: '/wp-admin/admin-ajax.php',
        type: 'POST',
        data: formData,
        // data: {
        //     action: 'order_gift_certificate',
        //     form_data: formData
        // },
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


$('#submit-code').on('click', function () {
    const giftCode = $('#gift-code').val();
    // const total = $('#input-total').val();
    const total = window.OrderData.total;
    const submitButton = $('#submit-code');
    const button = document.querySelector('#submit-code');

    if (submitButton.prop('disabled')) {
        return;
    }

    $('#loader-order').css('display','flex');

    if (!giftCode) {
        $('.code-result').css('display', 'block');
        $('.code-result').text('Введите промокод!');
        $('#loader-order').hide();
        return;
    }

    const formData = {
        action: 'use_gift_code',
        gift_code: giftCode,
        total: total
    };

    $.ajax({
        type: 'POST',
        url: '/wp-admin/admin-ajax.php',
        data: formData,
        success: function (response) {
            $('#loader-order').hide();
            if (response.success) {
                // $('#input-total').val(response.amount_with_sale);

                window.OrderData.total = response.amount_with_sale;
                window.OrderData.amountSale = response.amount_sale;

                let infoSeatTotal = document.querySelector('.info-seat-total');
                infoSeatTotal.innerHTML = `Итого <span class="dots"></span> ${response.amount_with_sale} ₽`;

                let infoSeatSale = document.querySelector('.info-seat-sale');
                infoSeatSale.innerHTML =`Скидка <span class="dots"></span> ${Number(response.amount_sale).toLocaleString('ru-RU')} ₽`;
                
                $('.code-result').css('display', 'block');
                $('.code-result').text(response.message);
                // $('#amount-sale').val(response.amount_sale);

                submitButton.prop('disabled', true);
                button.style.opacity = 0.5;
                button.style.cursor = 'default';
                button.style.pointerEvents = 'none';
                document.querySelector('#gift-code').style.pointerEvents = 'none';
                document.querySelector('#gift-code').style.opacity = 0.5;
            } else {
                $('.code-result').css('display', 'block');
                $('.code-result').text(response.message || 'Ошибка при обработке запроса.');
            }
        },
        error: function () {
            $('#loader-order').hide();
            $('.code-result').css('display', 'block');
            $('.code-result').text('Ошибка при отправке запроса.');
        }
    });
});


let closeButtonFunc = document.querySelectorAll('.closeModal-button');
let submitButtonCode = $('#submit-code');
let buttonCode = document.querySelector('#submit-code');
let infoSeatSaleCode = document.querySelector('.info-seat-sale');
let orderPrevStepButtonCode = document.getElementById('order-prev_step');

closeButtonFunc.forEach(function(buttons) {
    buttons.addEventListener('click', function(event) {
        event.preventDefault();
        $('.code-result').css('display', 'none');
        $('.code-result').text("");
        $('#amount-sale').val('');
        submitButtonCode.prop('disabled', false);
        buttonCode.style.opacity = 1;
        buttonCode.style.cursor = 'pointer';
        buttonCode.style.pointerEvents = 'auto';
        document.querySelector('#gift-code').style.pointerEvents = 'auto';
        document.querySelector('#gift-code').style.opacity = 1;
        infoSeatSaleCode.innerHTML = `Скидка <span class="dots"></span> 0 ₽`;
        setTimeout(() => {
            buttonCode.value = 'Применить';
        }, 100);
        $('#form-messages').hide().html('');
    });
});

orderPrevStepButtonCode.addEventListener('click', function() {
    $('.code-result').css('display', 'none');
    $('.code-result').text("");
    $('#amount-sale').val('');
    submitButtonCode.prop('disabled', false);
    buttonCode.style.opacity = 1;
    buttonCode.style.cursor = 'pointer';
    buttonCode.style.pointerEvents = 'auto';
    document.querySelector('#gift-code').style.pointerEvents = 'auto';
    document.querySelector('#gift-code').style.opacity = 1;
    infoSeatSaleCode.innerHTML = `Скидка <span class="dots"></span> 0 ₽`;
    setTimeout(() => {
        buttonCode.value = 'Применить';
    }, 100);
    $('#form-messages').hide().html('');
});