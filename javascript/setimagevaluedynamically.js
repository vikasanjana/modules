const  setImageUrlToInput = (imageUrl) =>{
   var inputElement = $('.pplr_monogram.fileupload')[0];
   var xhr = new XMLHttpRequest();
    xhr.open("GET", imageUrl, true);
    xhr.responseType = "blob";
    
    xhr.onload = function () {
      if (xhr.status === 200) {
        var blob = xhr.response;
    
        // Create a File object from the downloaded image blob
        var file = new File([blob], "image.jpg", { type: blob.type });
    
        // Create a new DataTransfer object and add the File object to it
        var dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
    
        // Set the files property of the file input element using the DataTransfer object
        inputElement.files = dataTransfer.files;
      }
    };

    xhr.send();
}
