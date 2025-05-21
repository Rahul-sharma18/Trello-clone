
const state = {
  boardId: null,
  boards: {},
  lists: {},
  cards: {},
  checkLists: {},
  checkItems: {},
};

const API_KEY = "73354637abed21b50def50995536e02b";
const API_TOKEN = "ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592";
const API_BASE = "https://api.trello.com/1";

const domElements = {
  main: document.querySelector(".main"),
  addNewList: document.querySelector(".add-new-list"),
  userInputCard1: document.querySelector(".user-input-card-1"),
  newCardOpen1: document.querySelector(".new-card-open-1"),
  addList: document.querySelector(".add-list"),
  crossButton1: document.querySelector(".cross-button-1"),
  header: document.querySelector("header")
};

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    const params = new URLSearchParams(window.location.search);
    const boardName = params.get("projectName");
    state.boardId = params.get("id");

    if (domElements.header && boardName) {
        domElements.header.innerText = boardName;
    }
    fetchBoardInfo();
}

// API calls - fetch data
async function fetchBoardInfo() {
    try {
        const response = await fetch(
        `${API_BASE}/boards/${state.boardId}?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "GET",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error("Failed to fetch board info");
        
        const boardData = await response.json();
        state.boards[boardData.id] = boardData;
        applyBoardStyling(boardData);
        fetchLists();
    } catch (error) {
        console.error("Error fetching board info:", error);
    }
}

async function fetchLists() {
    try {
        const response = await fetch(
        `${API_BASE}/boards/${state.boardId}/lists?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "GET",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error("Failed to fetch lists");
        const lists = await response.json();
        lists.forEach(list => {
        state.lists[list.id] = list;
        });
        renderLists();
        lists.forEach(list => {
        fetchCards(list.id);
        });
    } catch (error) {
        console.error("Error fetching lists:", error);
    }
}

async function fetchCards(listId) {
    try {
        const response = await fetch(
        `${API_BASE}/lists/${listId}/cards?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "GET",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to fetch cards for list ${listId}`);
        const cards = await response.json();
        cards.forEach(card => {
        state.cards[card.id] = card;
        });
        renderCards(listId);
    } catch (error) {
        console.error(`Error fetching cards for list ${listId}:`, error);
    }
}

async function fetchChecklists(cardId) {
    try {
        const response = await fetch(
        `${API_BASE}/cards/${cardId}/checklists?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "GET",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to fetch checklists for card ${cardId}`);
        const checklists = await response.json();
        checklists.forEach(checklist => {
        state.checkLists[checklist.id] = checklist;
        if (checklist.checkItems && checklist.checkItems.length > 0) {
            checklist.checkItems.forEach(item => {
            state.checkItems[item.id] = item;
            });
            }
        });
        return checklists;
    } catch (error) {
        console.error(`Error fetching checklists for card ${cardId}:`, error);
        return [];
    }
}

// API calls - modify data
async function createList(listName) {
    try {
        const response = await fetch(
        `${API_BASE}/lists?name=${encodeURIComponent(listName)}&idBoard=${state.boardId}&pos=bottom&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "POST",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error("Failed to create list");
        const newList = await response.json();
        state.lists[newList.id] = newList;
        renderLists();
        return newList;
    } catch (error) {
        console.error("Error creating list:", error);
        return null;
    }
}

async function archiveList(listId) {
    try {
        const response = await fetch(
        `${API_BASE}/lists/${listId}/closed?value=true&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "PUT",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to archive list ${listId}`);
        delete state.lists[listId];
        renderLists();
        return true;
    } catch (error) {
        console.error(`Error archiving list ${listId}:`, error);
        return false;
    }
}

async function createCard(listId, cardName) {
    try {
        const payload = {
        idBoard: state.boardId,
        closed: false,
        pos: "bottom",
        name: cardName
        };
        const response = await fetch(
        `${API_BASE}/cards/?idList=${listId}&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "POST",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
        );
        if (!response.ok) throw new Error(`Failed to create card in list ${listId}`);
        const newCard = await response.json();
        state.cards[newCard.id] = newCard;
        renderCards(listId);
        return newCard;
    } catch (error) {
        console.error(`Error creating card in list ${listId}:`, error);
        return null;
    }
}

async function deleteCard(cardId) {
    try {
        const response = await fetch(
        `${API_BASE}/cards/${cardId}?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "DELETE",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to delete card ${cardId}`);
        const card = state.cards[cardId];
        const listId = card?.idList;
        delete state.cards[cardId];
        if (listId) {
        renderCards(listId);
        }
        return true;
    } catch (error) {
        console.error(`Error deleting card ${cardId}:`, error);
        return false;
    }
}

async function createChecklist(cardId, name) {
    try {
        const response = await fetch(
        `${API_BASE}/cards/${cardId}/checklists?name=${encodeURIComponent(name)}&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "POST",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to create checklist for card ${cardId}`);
        const newChecklist = await response.json();
        state.checkLists[newChecklist.id] = newChecklist;
        return newChecklist;
    } catch (error) {
        console.error(`Error creating checklist for card ${cardId}:`, error);
        return null;
    }
}

async function deleteChecklist(checklistId) {
    try {
        const response = await fetch(
        `${API_BASE}/checklists/${checklistId}?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "DELETE",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to delete checklist ${checklistId}`);
        delete state.checkLists[checklistId];
        for (const itemId in state.checkItems) {
        if (state.checkItems[itemId].idChecklist === checklistId) {
            delete state.checkItems[itemId];
        }
        }
        return true;
    } catch (error) {
        console.error(`Error deleting checklist ${checklistId}:`, error);
        return false;
    }
}

async function createChecklistItem(checklistId, name) {
    try {
        const response = await fetch(
        `${API_BASE}/checklists/${checklistId}/checkItems?name=${encodeURIComponent(name)}&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "POST",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to create checklist item in checklist ${checklistId}`);
        const newItem = await response.json();
        state.checkItems[newItem.id] = newItem;
        return newItem;
    } catch (error) {
        console.error(`Error creating checklist item in checklist ${checklistId}:`, error);
        return null;
    }
}

async function deleteChecklistItem(checklistId, itemId) {
    try {
        const response = await fetch(
        `${API_BASE}/checklists/${checklistId}/checkItems/${itemId}?key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "DELETE",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to delete checklist item ${itemId}`);
        delete state.checkItems[itemId];
        return true;
    } catch (error) {
        console.error(`Error deleting checklist item ${itemId}:`, error);
        return false;
    }
}

async function updateChecklistItemState(cardId, checklistId, itemId, isComplete) {
    try {
        const state = isComplete ? "complete" : "incomplete";
        const response = await fetch(
        `${API_BASE}/cards/${cardId}/checklist/${checklistId}/checkItem/${itemId}?state=${state}&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "PUT",
            headers: { Accept: "application/json" }
        }
        );
        if (!response.ok) throw new Error(`Failed to update checklist item ${itemId}`);
        const updatedItem = await response.json();
        const itemState = isComplete ? "complete" : "incomplete";
        
        return updatedItem;
    } catch (error) {
        console.error(`Error updating checklist item ${itemId}:`, error);
        return null;
    }
}

// Rendering functions
function applyBoardStyling(board) {
    const body = document.querySelector("body");
    const imageUrl = board?.prefs?.backgroundImage;
    const bgColor = board?.prefs?.backgroundColor;
    
    if (imageUrl) {
        body.style.backgroundImage = `url('${imageUrl}')`;
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
        document.body.style.height = "100vh";
    } else if (bgColor) {
        body.style.backgroundColor = bgColor;
    } else {
        body.style.backgroundColor = "#dcdfe4";
        document.body.style.height = "100vh";
    }
}

function renderLists() {
    domElements.main.innerHTML = "";
    Object.values(state.lists).forEach(list => {
        const listElement = createListElement(list);
        domElements.main.appendChild(listElement);
        renderCards(list.id)
    });
    
    const addListButton = createAddListButton();
    domElements.main.appendChild(addListButton);
}

function createListElement(list) {
    const listElement = document.createElement("div");
    listElement.className = "list h-fit min-w-2xs rounded-2xl p-2 single-card bg-white border-2 flex flex-col";
    listElement.style.position = "relative";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = list.name;
    titleInput.className = "list-title w-45 px-4 py-2 h-7 placeholder:font-bold placeholder:text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.className = "absolute top-2 right-6 text-red-500 hover:text-red-700 z-10 cursor-pointer";
    deleteBtn.title = "Delete list";
    deleteBtn.onclick = () => archiveList(list.id);
    
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "card-wrapper flex flex-col gap-2 mt-2";
    cardWrapper.dataset.id = list.id;
    
    const cardTextarea = document.createElement("textarea");
    cardTextarea.placeholder = "Enter a title";
    cardTextarea.className = "user-input-card mt-1 hidden w-full overflow-hidden resize-none border font-light border-gray-300 p-2 rounded-md";
    cardTextarea.rows = 1;
    cardTextarea.oninput = function() {
        this.style.height = '';
        this.style.height = this.scrollHeight + 'px';
    };
    const addCardBtn = document.createElement("button");
    addCardBtn.className = "card-button w-45 mt-2 h-10 pr-16 rounded-md cursor-pointer hover:bg-slate-300";
    addCardBtn.textContent = "+ Add a card";
    addCardBtn.onclick = () => showAddCardForm(listElement);

    const newCardOpen = document.createElement("div");
    newCardOpen.className = "new-card-open flex gap-0.5 hidden font-light";
    const confirmAddCardBtn = document.createElement("button");
    confirmAddCardBtn.className = "add-card p-2 mt-2 h-10 rounded-md cursor-pointer font-[500] bg-blue-500 text-white";
    confirmAddCardBtn.textContent = "Add card";
    confirmAddCardBtn.onclick = () => {
        const cardName = cardTextarea.value.trim();
        if (cardName) {
        createCard(list.id, cardName);
        cardTextarea.value = " ";
        }
        hideAddCardForm(listElement);
    };
    
    const cancelAddCardBtn = document.createElement("button");
    cancelAddCardBtn.className = "cross-button w-10 mt-2 rounded-md cursor-pointer hover:bg-slate-300";
    cancelAddCardBtn.textContent = "X";
    cancelAddCardBtn.onclick = () => { hideAddCardForm(listElement); cardTextarea.value=""};

    newCardOpen.append(confirmAddCardBtn, cancelAddCardBtn);
    listElement.append(titleInput, deleteBtn, cardWrapper, cardTextarea, addCardBtn, newCardOpen);
    return listElement;
}

function createAddListButton() {
    const container = document.createElement("div");
    container.className = "list h-fit min-w-2xs rounded-2xl single-card bg-white flex flex-col border-0";
    
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Enter a title";
    textarea.className = "user-input-card-1 hidden min-w-3xs m-2 overflow-hidden resize-none border font-light border-gray-300 p-2 rounded-md";
    textarea.rows = 1;
    textarea.oninput = function() {
        this.style.height = '';
        this.style.height = this.scrollHeight + 'px';
    };
  
    const addButton = document.createElement("button");
    addButton.className = "add-new-list cursor-pointer hover:bg-slate-300 h-12 min-w-3xs rounded-2xl bg-slate-200 p-2";
    addButton.textContent = "+ Add another list";
    addButton.onclick = () => {
        textarea.classList.remove("hidden");
        addButton.classList.add("hidden");
        buttonsContainer.classList.remove("hidden");
    };
  
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "new-card-open-1 flex gap-0.5 hidden font-light min-w-2xs m-2 mt-0";
    const confirmButton = document.createElement("button");
    confirmButton.className = "add-list p-2 h-10 rounded-md cursor-pointer font-[500] bg-blue-500 text-white";
    confirmButton.textContent = "Add list";
    confirmButton.onclick = () => {
        const listName = textarea.value.trim();
        if (listName) {
        createList(listName);
        textarea.value = "";
        }
        textarea.classList.add("hidden");
        addButton.classList.remove("hidden");
        buttonsContainer.classList.add("hidden");
    };
  
    const cancelButton = document.createElement("button");
    cancelButton.className = "cross-button-1 w-10 rounded-md cursor-pointer hover:bg-slate-300";
    cancelButton.textContent = "X";
    cancelButton.onclick = () => {
        textarea.classList.add("hidden");
        addButton.classList.remove("hidden");
        buttonsContainer.classList.add("hidden");
    };

    buttonsContainer.append(confirmButton, cancelButton);
    container.append(textarea, addButton, buttonsContainer);
    return container;
}

function renderCards(listId) {
    const cardWrapper = document.querySelector(`[data-id="${listId}"]`);
    if (!cardWrapper) return;

    cardWrapper.innerHTML = "";
    const listCards = Object.values(state.cards).filter(card => card.idList === listId);
    
    listCards.forEach(card => {
        const cardElement = createCardElement(card);
        cardWrapper.appendChild(cardElement);
    });
}

function createCardElement(card) {
    const cardElement = document.createElement("div");
    cardElement.className = "w-full p-4 flex rounded-2xl bg-slate-200";

    const input = document.createElement("input");
    input.type = "text";
    input.value = card.name;
    input.className = "w-full bg-transparent outline-none py-2";

    input.addEventListener("blur", () => {
        if (input.value.trim() !== card.name) {
        updateCardName(card.id, input.value);
        }
    });
    
    input.addEventListener("click", () => {
        openChecklistModal(card.id, card.name);
    });
    
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.className = "text-red-500 hover:text-red-700 cursor-pointer ml-2";
    deleteBtn.onclick = () => deleteCard(card.id);

    cardElement.append(input, deleteBtn);
    return cardElement;
}

async function openChecklistModal(cardId, cardName) {

    const modalBg = document.createElement("div");
    modalBg.className = "fixed inset-0 bg-black/75 flex justify-center items-center z-[9999]";
  
    const modal = document.createElement("div");
    modal.className = "bg-white p-4 rounded w-2/3 h-[600px] relative overflow-y-auto";

    const closeButton = document.createElement("button");
    closeButton.className = "absolute top-2 right-2 text-xl cursor-pointer";
    closeButton.innerHTML = "×";
    closeButton.onclick = () => modalBg.remove();

    const title = document.createElement("h2");
    title.className = "text-xl font-bold mb-4";
    title.textContent = `Checklist for "${cardName}"`;

    const checklistContainer = document.createElement("div");
    checklistContainer.className = "flex flex-col gap-2";

    const checklists = await fetchChecklists(cardId);

    checklists.forEach(checklist => {
        const checklistElement = createChecklistElement(checklist, cardId, checklistContainer);
        checklistContainer.appendChild(checklistElement);
    });
    
    // Add new checklist form
    const input = document.createElement("input");
    input.placeholder = "Add checklist";
    input.className = "border p-2 rounded w-full mt-8";
  
    const addBtn = document.createElement("button");
    addBtn.textContent = "Add checklist";
    addBtn.className = "bg-blue-500 text-white px-4 py-2 rounded mt-1 cursor-pointer";
    addBtn.onclick = async () => {
        if (input.value.trim() !== "") {
        const newChecklist = await createChecklist(cardId, input.value);
        if (newChecklist) {
            input.value = "";

            checklistContainer.innerHTML = "";
            const refreshedChecklists = await fetchChecklists(cardId);
            refreshedChecklists.forEach(checklist => {
            const checklistElement = createChecklistElement(checklist, cardId, checklistContainer);
            checklistContainer.appendChild(checklistElement);
            });
        }
        }
    };
    modal.append(closeButton, title, checklistContainer, input, addBtn);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

function createChecklistElement(checklist, cardId, checklistContainer) {
    const checklistElement = document.createElement("div");
    checklistElement.className = "checkList flex flex-col border-0 rounded-md";
    checklistElement.id = checklist.id;

    const header = document.createElement("div");
    header.className = "flex items-center gap-2 text-2xl px-2 mt-5";
    
    const label = document.createElement("span");
    label.textContent = checklist.name;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "text-red-500 hover:text-red-700 ml-auto cursor-pointer";
    deleteBtn.onclick = async () => {
        const success = await deleteChecklist(checklist.id);
        if (success) {
        checklistElement.remove();
        }
    };
        
    const progressWrapper = document.createElement("div");
    progressWrapper.className = "w-full bg-gray-700 rounded h-2 mb-2";
    const progressBar = document.createElement("div");
    progressBar.className = "bg-green-500 h-2 rounded transition-all duration-300";
    progressBar.style.width = "0%";
    progressWrapper.appendChild(progressBar);

    const checkItemsContainer = document.createElement("div");
    checkItemsContainer.className = "check-items-container";

    if (checklist.checkItems && checklist.checkItems.length > 0) {
        checklist.checkItems.forEach(item => {
        const itemElement = createChecklistItemElement(item, cardId, checklist.id);
        checkItemsContainer.appendChild(itemElement);
        });
    }

    updateChecklistProgress(checklist.id);
    const itemFormContainer = document.createElement("div");
    itemFormContainer.className = "hidden";
    
    const itemInput = document.createElement("input");
    itemInput.placeholder = "Add check item";
    itemInput.className = "border p-2 rounded w-1/2 mt-3 ml-[3%] mr-[5%]";
    
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.className = "h-[100%] border-solid border-red border-slate-400 border-2 rounded-[10px] cursor-pointer bg-green-700 p-2 m-1";
    submitBtn.onclick = async () => {
        if (itemInput.value.trim() !== "") {
        const newItem = await createChecklistItem(checklist.id, itemInput.value);
        if (newItem) {
            const itemElement = createChecklistItemElement(newItem, cardId, checklist.id);
            checkItemsContainer.appendChild(itemElement);
            updateChecklistProgress(checklist.id);
            itemInput.value = "";
            itemFormContainer.classList.add("hidden");
            addItemBtn.classList.remove("hidden");
        }
        }
    };
    
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "h-[100%] border-solid mr-0 border-red border-slate-400 border-2 rounded-[10px] cursor-pointer bg-red-700 p-2 m-1";
    cancelBtn.onclick = () => {
        itemFormContainer.classList.add("hidden");
        addItemBtn.classList.remove("hidden");
        itemInput.value = "";
    };
    itemFormContainer.append(itemInput, submitBtn, cancelBtn);
    const addItemBtn = document.createElement("button");
    addItemBtn.textContent = "Add Item";
    addItemBtn.className = "bg-blue-500 text-white Justify-content px-4 py-2 rounded mt-1 ml-[3%] cursor-pointer w-fit";
    addItemBtn.onclick = () => {
        itemFormContainer.classList.remove("hidden");
        addItemBtn.classList.add("hidden");
    };
    header.append(label, deleteBtn);
    checklistElement.append(header, progressWrapper, checkItemsContainer, itemFormContainer, addItemBtn);
    return checklistElement;
}

function createChecklistItemElement(item, cardId, checklistId) {
    const itemElement = document.createElement("div");
    itemElement.className = "flex bg-slate-50 gap-5 pl-8 pr-3 mt-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.state === "complete";

    const itemName = document.createElement("div");
    itemName.textContent = item.name;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className =
        "text-red-500 hover:text-red-700 ml-auto cursor-pointer";
    deleteBtn.onclick = async () => {
        const success = await deleteChecklistItem(checklistId, item.id);
        if (success) {
        itemElement.remove();
        updateChecklistProgress(checklistId);
        }
    };

    if (checkbox.checked) {
        itemElement.classList.add("line-through", "text-slate-500");
    }

    checkbox.addEventListener("change", async () => {
    const isChecked = checkbox.checked;
    await updateChecklistItemState(cardId, checklistId, item.id, isChecked);
    if (isChecked) {
      itemElement.classList.add("line-through", "text-slate-500");
    } else {
      itemElement.classList.remove("line-through", "text-slate-500");
    }
    updateChecklistProgress(checklistId);
    });
    itemElement.append(checkbox, itemName, deleteBtn);
    return itemElement;
}

function updateChecklistProgress(checklistId) {
    const checklistElement = document.getElementById(checklistId);
    if (!checklistElement) return;
    const checkboxes = checklistElement.querySelectorAll(
        'input[type="checkbox"]'
    );
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter((cb) => cb.checked).length;
    if (total === 0) {
        checklistElement.querySelector(".bg-green-500").style.width = "0%";
        return;
    }
    const percentage = (checked / total) * 100;
    checklistElement.querySelector(
        ".bg-green-500"
    ).style.width = `${percentage}%`;
}

async function updateCardName(cardId, newName) {
    try {
        const response = await fetch(
        `${API_BASE}/cards/${cardId}?name=${encodeURIComponent(
            newName
        )}&key=${API_KEY}&token=${API_TOKEN}`,
        {
            method: "PUT",
            headers: { Accept: "application/json" },
        }
        );
        if (!response.ok) throw new Error(`Failed to update card ${cardId}`);
        const updatedCard = await response.json();
        state.cards[cardId] = updatedCard;
        return updatedCard;
    } catch (error) {
        console.error(`Error updating card ${cardId}:`, error);
        return null;
    }
}

function showAddCardForm(listElement) {
    const addCardBtn = listElement.querySelector(".card-button");
    addCardBtn.classList.add("hidden");

    const textarea = listElement.querySelector(".user-input-card");
    textarea.classList.remove("hidden");

    const actionButtons = listElement.querySelector(".new-card-open");
    actionButtons.classList.remove("hidden");
    textarea.focus();
}

function hideAddCardForm(listElement) {

    const addCardBtn = listElement.querySelector(".card-button");
    addCardBtn.classList.remove("hidden");

    const textarea = listElement.querySelector(".user-input-card");
    textarea.classList.add("hidden");

    const actionButtons = listElement.querySelector(".new-card-open");
    actionButtons.classList.add("hidden");
}
