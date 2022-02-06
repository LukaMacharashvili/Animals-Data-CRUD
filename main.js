class Animal {
    id;
    name;
    breed;
    age;
    gender;
    ownerName;
    image;

    constructor(id, name, breed, age, gender, owner, image) {
        this.id = id;
        this.name = name;
        this.breed = breed;
        this.age = age;
        this.gender = gender;
        this.ownerName = owner;
        this.image = image;
    }
}

class FirebaseWorker {
    firebaseRef;

    constructor() {
        this.firebaseRef = firebase.firestore();
    }

    async addAnimal(animalItem, resultCheckFunction) {
        try {
            var json = JSON.stringify(animalItem);
            var result = await this.firebaseRef.collection("animals").add(JSON.parse(json));
            console.log("Animal id : ", result.id);
            resultCheckFunction();
        } catch (error) {
            console.log("Error", error);
        }
    }

    async readlAllAnimals(resultCheckFunction) {
        try {
            var result = await this.firebaseRef.collection("animals").get();
            resultCheckFunction(result);
        } catch (error) {
            console.log("Error ", error);
        }
    }

    async getAnimalById(id, resultCheckFunction) {
        try {
            var result = await this.firebaseRef.collection("animals").doc(id).get();
            if (result.exists) {
                var tmpObj = result.data();
                tmpObj.id = result.id;
                console.log(tmpObj);
                resultCheckFunction(tmpObj);
            }
        } catch (error) {
            console.log("Error", error);
        }
    }

    async deleteAnimalById(id, resultCheckFunction) {
        try {
            await this.firebaseRef.collection("animals").doc(id).delete();
            console.log("success");
            resultCheckFunction();
        } catch (error) {
            console.log("Error", error);
        }
    }
    async updateAnimalById(animalItem, id, resultCheckFunction) {
        try {
            var json = JSON.stringify(animalItem);
            await this.firebaseRef.collection("animals").doc(id).update(JSON.parse(json));
            console.log("Animal id : ");
            console.log("success");
            resultCheckFunction();
        } catch (error) {
            console.log("Error", error);
        }
    }


    async deleteAllAnimals() {
        try {
            await this.firebaseRef.collection("animals").delete();
            console.log("success");
        } catch (error) {
            console.log("Error", error);
        }
    }
}

class HtmlWorker {
    firebaseWorker;
    constructor(firebaseWorker) {
        this.firebaseWorker = firebaseWorker;
        this.initData();
        this.addNewAnimal();
    }
    initData() {
        var self = this;
        this.firebaseWorker.readlAllAnimals(function(data) {
            self.generateCardsOnArea(data);
        });
    }
    generateAnimalCard(animal) {
        return `
        <div class="card" style="width: 18rem;">
        <img class="card-img-top" src="${animal.image}" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">${animal.name}</h5>
            <p class="card-text">${animal.ownerName}</p>
            <p class="card-text">${animal.gender}</p>
            <p class="card-text">${animal.age}</p>
            <p class="card-text">${animal.breed}</p>
        </div>
        <div class="buttons-area">
        <button class="btn btn-warning"onclick="htmlWorker.updateAnimal('${animal.id}')" data-bs-toggle="modal" data-bs-target="#staticBackdrop"><i class="fas fa-pencil-alt"></i></button>
        <button class="btn btn-danger" onclick="htmlWorker.deleteAnimal(this,'${animal.id}')"><i class="fas fa-door-closed"></i></button>
        </div>
        </div>`
    }
    updateAnimal(animalId) {
        let self = this;
        this.firebaseWorker.getAnimalById(animalId, function(result) {
            let updateFormBody = document.querySelector(".modal-body");
            updateFormBody.innerHTML = self.generateAnimalUpdateForm(result);
            const nameInp = document.querySelector("#nameUpdate");
            const breedInp = document.querySelector("#breedUpdate");
            const ageInp = document.querySelector("#ageUpdate");
            const imageInp = document.querySelector("#imageUpdate");
            const ownerInp = document.querySelector("#ownerNameUpdate");
            const genderInp = document.querySelector("#genderUpdate")
            const updateAnimalBtn = document.querySelector("#updateAnimal")
            updateAnimalBtn.addEventListener("click", function() {
                let closeBtn = document.querySelector(".btn-close")
                let animal = new Animal("", nameInp.value, breedInp.value, ageInp.value, genderInp.value, ownerInp.value, imageInp.value);
                self.firebaseWorker.updateAnimalById(animal, animalId, function() {
                    self.initData()
                    closeBtn.click();
                })
            })
        })
    }
    generateCardsOnArea(response) {
        let self = this;
        let cardsArea = document.querySelector(".cards-area")
        cardsArea.innerHTML = "";
        response.forEach(animal => {
            let animalItem = animal.data();
            animalItem.id = animal.id;
            cardsArea.innerHTML = self.generateAnimalCard(animalItem);
            console.log(animalItem)
        })
    }
    deleteAnimal(thisElement, id) {
        let self = this;
        let cardsArea = document.querySelector(".cards-area")
        this.firebaseWorker.deleteAnimalById(id, function() {
            cardsArea.removeChild(thisElement.parentNode.parentNode)
        })
    }
    clearAllInput() {
        const nameInp = document.querySelector(".name");
        const breedInp = document.querySelector(".breed");
        const ageInp = document.querySelector(".age");
        const ownerInp = document.querySelector(".owner");
        const genderInp = document.querySelector(".gender");
        const imageInp = document.querySelector(".image");
        nameInp.value = "";
        breedInp.value = "";
        ageInp.value = "";
        ownerInp.value = "";
        genderInp.value = "";
        imageInp.value = "";
    }
    addNewAnimal() {
        let self = this;
        const nameInp = document.querySelector(".name");
        const breedInp = document.querySelector(".breed");
        const ageInp = document.querySelector(".age");
        const ownerInp = document.querySelector(".owner");
        const genderInp = document.querySelector(".gender");
        const imageInp = document.querySelector(".image");
        const saveAnimalBtn = document.querySelector(".save");
        saveAnimalBtn.addEventListener("click", function() {
            let animal = new Animal("", nameInp.value, breedInp.value, ageInp.value, genderInp.value, ownerInp.value, imageInp.value)
            self.firebaseWorker.addAnimal(animal, function() {
                self.initData();
            })
            self.clearAllInput();
        })
    }
    generateAnimalUpdateForm(animal) {
        return `
        <img src="${animal.image}"/>
        <div class="form-group">
            <label for="">Enter animal Name</label>
            <input
            id="nameUpdate"
            value="${animal.name}"
            type="text"
            placeholder="Enter here"
            class="form-control"
            />
        </div>
        <div class="form-group">
            <label for="">Enter animal Breed</label>
            <input
            id="breedUpdate"
            value="${animal.breed}"
            type="text"
            placeholder="Enter here"
            class="form-control"
            />
        </div>
        <div class="form-group">
            <label for="">Enter animal Age</label>
            <input
            id="ageUpdate"
            value="${animal.age}"
            type="email"
            placeholder="Enter here"
            class="form-control"
            />
        </div>
        <div class="form-group">
            <label for="">Enter animal Image</label>
            <input
            id="imageUpdate"
            value="${animal.image}"
            type="text"
            placeholder="Enter here"
            class="form-control"
            />
        </div>
        <div class="form-group">
            <label for="">Enter Owner Name</label>
            <input
            id="ownerNameUpdate"
            value="${animal.ownerName}"
            type="text"
            placeholder="Enter here"
            class="form-control"
            />
        </div>
        <div class="form-group">
            <label for="">Enter Animal Gender</label>
            <input
            id="genderUpdate"
            value="${animal.gender}"
            type="text"
            placeholder="Enter here"
            class="form-control"
            />
        </div>`
    }
}

let htmlWorker = new HtmlWorker(new FirebaseWorker())