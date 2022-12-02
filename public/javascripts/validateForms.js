//Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
    bsCustomFileInput.init()

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    //在form添加 class類別 = validated-form 
    const forms = document.querySelectorAll('.validated-form')


    //對找到的每一個表單 將添加一個用於提交的事件偵聽器
    //如果嘗試提交表單 將調用form 檢查有效性
    //如果返回 false 將阻止提交並停止傳播
    // Loop over them and prevent submission
    //Array.prototype.slice.call(forms)
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()
