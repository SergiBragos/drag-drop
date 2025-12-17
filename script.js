//INFO: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

//Elements relatius al drag&drop
const cards = document.querySelectorAll(".card");
const lists = document.querySelectorAll(".list");

//Elements relatius al formulari
const cardFormEl = document.getElementById("card-form");
const descriptionEl = document.getElementById("description");
const categorySelector = document.getElementById("category");

//Funcions del drag&drop
for(const card of cards){
  card.addEventListener("dragstart",dragStart);
  card.addEventListener("dragend",dragEnd);
}

for(const list of lists){
  list.addEventListener("dragover",dragOver);
  list.addEventListener("dragenter",dragEnter);
  list.addEventListener("dragleave",dragLeave);
  list.addEventListener("drop",dragDrop);
}

function dragStart(e){
  //permet a la ubicació de destinació quin element li has afegit quan el deixis anar
  e.dataTransfer.setData("text/plain",this.id);
}

function dragEnd(){
  //de moment no es fa res, però en aquesta funció s'hi poden implementar coses per fer quan acabi l'arrossegament
  console.log("Drag ended");
}

function dragOver(e){
  //important perquè els navegadors no et permeten arrossegar elements dins el propi navegador, això impedeix aquesta restricció
  e.preventDefault();
}

function dragEnter(e){
  //Afegir la classe "over" a la llista de destinació de l'element que arrossegues
  this.classList.add("over");
}

function dragLeave(e){
  //Treure la classe "over" a la llista de destinació de l'element que arrossegues
  this.classList.remove("over");
}

function dragDrop(e){
  const id = e.dataTransfer.getData("text/plain",this.id);
  const card = document.getElementById(id);
  this.appendChild(card);
  this.classList.remove("over");
  //Actualitzem el JSON kanban sencer per tenir en compte la ubicació nova d'aquesta targeta
  saveKanbanData();
}

//Funcions del formulari
//Si es clica el boitó d'Add card es crida la funció addTransaction
cardFormEl.addEventListener("submit", submit)

function submit(e){
  //quan apretes el botó de submit, el comportament del formulari és refrescar-se directament. Cridem una funció que ho evita.
  e.preventDefault();
  //crear una variable per a cada valor dins del form
  const description = descriptionEl.value.trim();
  const category = categorySelector.value;
  
  //funcions de la lògica d'afegir transaccions
  newCard = createNewCard(description);
  addNewCard(category, newCard);
  saveKanbanData();
  //buidar el contingut del formulari
  cardFormEl.reset();
}

function createNewCard(desc){
  let newCard = document.createElement("div");
  newCard.classList.add("card");
  newCard.id = Date.now().toString();
  newCard.draggable = "true";
  let textSpan = document.createElement("span");
  textSpan.textContent = desc;
  newCard.appendChild(textSpan);
  let xButton = document.createElement("div");
  xButton.textContent = "x";
  xButton.classList.add("xButton");
  xButton.addEventListener("click",() => removeCard(newCard))
  //Afegim els addEventListener per tal que es cridin els mètodes d'arrossegament per a aquestes transaccions.
  newCard.addEventListener("dragstart", dragStart);
  newCard.addEventListener("dragend", dragEnd);
  newCard.appendChild(xButton);
  return newCard;
}

function addNewCard(cat, newCard){
  for(const list of lists){
    if(list.id === cat){
      list.appendChild(newCard);
    }
  }
}

function getKanbanData(){
  return JSON.parse(localStorage.getItem("kanban")) || {
    "to-do": [],
    "in-progress": [],
    "done": []
  };
  //retorna el kanban guardat a localStorage, en cas que no n'hi hagi crea un element kanban buit {"to-do": [], "in-progress": [], "done": []}
}

function saveKanbanData(){
  const kanban = {
    "to-do": [],
    "in-progress": [],
    "done": []
  };

  for(const list of lists){
    const cards = list.querySelectorAll(".card");
    cards.forEach(card => {
      kanban[list.id].push({
        id: card.id,
        text: card.querySelector("span").textContent
      });
    });
  }

  localStorage.setItem("kanban", JSON.stringify(kanban));
}

function loadKanbanData(){
  const data = getKanbanData();

  for(const list of lists){
    list.querySelectorAll(".card").forEach(card => card.remove());

    data[list.id].forEach(cardData => {
      const card = createNewCard(cardData.text);
      card.id = cardData.id;
      list.appendChild(card);
    });
  }
}

function removeCard(card){
  card.remove();
  saveKanbanData();
}

loadKanbanData();