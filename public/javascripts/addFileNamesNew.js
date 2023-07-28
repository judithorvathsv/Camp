
  const addedImages = document.getElementsByClassName("addedImages")
  for (const el of addedImages) {
    el.onchange = (e) => previewMultiple(e)   
  }

function previewMultiple(event){  
    console.log('bent')
    console.log(event)
    const form = document.querySelector('#formFile');
    form.innerHTML = "";
    var images = document.getElementById("image");    
    var number = images.files.length;  
    for(i=0; i < number; i++){       
        var urls = URL.createObjectURL(event.target.files[i]);  
        form.innerHTML += '<img src="' + urls + '">';    
    }
}