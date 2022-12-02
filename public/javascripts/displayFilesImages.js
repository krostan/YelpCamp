function previewMultiple(event) {
    const form = document.querySelector("#formFile")
    form.innerHTML = '';
    const images = document.getElementById("image");
    const number = images.files.length;
    for (i = 0; i < number; i++) {
        const urls = URL.createObjectURL(event.target.files[i]);
        form.innerHTML += '<img src="' + urls + '">';
    }
}