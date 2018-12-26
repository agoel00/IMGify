var openFile = function(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
        var dataURL = reader.result;
        var output = document.getElementById('output-img');
        console.log('preparing to show img');
        output.src = dataURL;
        console.log('img displayed');
    };
    reader.readAsDataURL(input.files[0]);
};

let model;
async function loadModel() {
  console.log("model loading..");

  // display model loading progress box

  loader = document.querySelector(".loader");
  loader.style.display = "block";
  load_button = document.getElementById("loadBtn");
  load_button.innerHTML = "Loading"

  // model name is "mobilenet"
  modelName = "mobilenet";
  
  // clear the model variable
  model = undefined;
  
  // load the model using a HTTPS request (where you have stored your model files)
  model = await tf.loadModel('model/model.json');
  
  // hide model loading progress box
  loader.style.display = "none";
  load_button.disabled = true;
  load_button.innerHTML = "Loaded Model";
  console.log("model loaded..");
}

// preprocess the image to be mobilenet friendly
function preprocessImage(image, modelName) {

    // resize the input image to mobilenet's target size of (224, 224)
    let tensor = tf.fromPixels(image)
      .resizeNearestNeighbor([224, 224])
      .toFloat();
  
    // if model is not available, send the tensor with expanded dimensions
    if (modelName === undefined) {
      return tensor.expandDims();
    } 
  
    // if model is mobilenet, feature scale tensor image to range [-1, 1]
    else if (modelName === "mobilenet") {
      let offset = tf.scalar(127.5);
      return tensor.sub(offset)
        .div(offset)
        .expandDims();
    } 
  
    // else throw an error
    else {
      alert("Unknown model name..")
    }
  }

// If "Predict Button" is clicked, preprocess the image and
// make predictions using mobilenet
let predictBtn = document.querySelector("#predict-button");
predictBtn.addEventListener("click", async () => {
    if (model== undefined){
        alert('please load model first')
    }
    let out = document.getElementById("output")
    out.style.display = "block"
    
    let image = document.getElementById("output-img")
    console.log(image);
    let tensor = preprocessImage(image, modelName)
    let predictions = await model.predict(tensor).data()
    console.log('fetched predictions');
    let results = Array.from(predictions)
        .map(function (p, i) {
            return {
                probability: p,
                className: IMAGENET_CLASSES[i]
            };
        }).sort(function (a, b) {
            return b.probability - a.probability;
        }).slice(0, 5);
    
    console.log(results);
    document.getElementById('prediction').innerHTML = "Prediction: -<br> <b>" + results[0].className + "</b>"

    var ul = document.getElementById("predict-list")
    ul.innerHTML = "";
    results.forEach(function (p) {
        console.log(p.className + " " + p.probability.toFixed(6));
        var li = document.createElement("LI");
        // li.innerHTML = p.className + " " + p.probability.toFixed(6);
        li.innerHTML = p.className
        li.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-center')
        var span = document.createElement("span");
        span.innerHTML = p.probability.toFixed(6)
        span.setAttribute('class', 'badge badge-primary badge-pill')
        li.appendChild(span)
        ul.appendChild(li);
    })
})

let clearBtn = document.querySelector("#clearBtn");

clearBtn.addEventListener("click", () => {
  let img = document.querySelector("#output-img");
  img.src = "";
  let box = document.querySelector("#output");
  box.style.display = "none";

})

let alertBtn = document.querySelector("#alert-btn");

alertBtn.addEventListener("click", () => {
  let out = document.querySelector("#output");
  out.style.display = "none";
})