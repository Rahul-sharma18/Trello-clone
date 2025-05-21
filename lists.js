let boardId;
let board = {};
var listId;

const state = {
  boards: [],
  lists: [],
  cards: [],
  checkList: [],
  checkItems: [],
};

const main = document.querySelector(".main");
const addNewList = document.querySelector(".add-new-list");
const userInputCard1 = document.querySelector(".user-input-card-1");
const newCardOpen1 = document.querySelector(".new-card-open-1");
const addList = document.querySelector(".add-list");
const crossButton1 = document.querySelector(".cross-button-1");

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("projectName");
  boardId = params.get("id");
  getBoardInfo(boardId);
  getListInfo(boardId);
  // getAllCard(id);
  document.querySelector("header").innerText = `${name}`;
});

function getNode(htmlString) {
  const node = document.createElement("template");
  node.innerHTML = htmlString.trim();
  return node.content.firstElementChild;
}

function addNewCard(list) {
  const userInputCard = list.querySelector(".user-input-card");
  const newCardOpen = list.querySelector(".new-card-open");
  const addButton = list.querySelector(".card-button");
  const addCard = list.querySelector(".add-card");
  const crossButton = list.querySelector(".cross-button");
  const cardWrapper = list.querySelector(".card-wrapper");

  userInputCard.classList.remove("hidden");
  newCardOpen.classList.remove("hidden");
  addButton.classList.add("hidden");

  addCard.onclick = () => {
    const name = userInputCard.value.trim();
    if (name !== "") {
      // card container
      const card = document.createElement("div");
      card.classList =
        "w-full flex flex-row items-center justify-between gap-2 p-2 p-4 rounded-2xl bg-slate-200";

      // Wrapper div for input and delete button, so they stay in a single line
      const inputWrapper = document.createElement("div");
      inputWrapper.className = "flex items-center w-full gap-2";

      // Input field
      const input = document.createElement("input");
      input.type = "text";
      input.value = name;
      input.classList = "flex-grow bg-transparent outline-none";

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.classList =
        "text-red-500 hover:text-red-700 cursor-pointer ml-2 transition-colors duration-200";
      deleteBtn.title = "Delete card";

      // Delete logic
      deleteBtn.onclick = () => {
        card.remove();
        // call Trello delete API here
      
      };

      input.addEventListener("blur", () => {
        console.log("Edited card:", input.value);
        // You can call updateCard(cardId, input.value) here if needed
      });

      // Append input and delete button inside the inputWrapper div
      inputWrapper.appendChild(input);
      inputWrapper.appendChild(deleteBtn);
      // Append the inputWrapper div to the card container
      card.appendChild(inputWrapper);

      // Append the new card to the cardWrapper (list)
      cardWrapper.appendChild(card);

      // Save to Trello
      const listId = cardWrapper.getAttribute("data-id");
      updateCard(listId, name);
      userInputCard.value = "";
    }

    userInputCard.classList.add("hidden");
    newCardOpen.classList.add("hidden");
    addButton.classList.remove("hidden");
  };

  crossButton.onclick = () => {
    userInputCard.classList.add("hidden");
    newCardOpen.classList.add("hidden");
    addButton.classList.remove("hidden");
  };
}

function addNewListByUser() {
  addNewList.classList.add("hidden");
  userInputCard1.classList.remove("hidden");
  newCardOpen1.classList.remove("hidden");
}

function addUserInputList() {
  const newElement = document.createElement("div");
  newElement.classList.add(
    "min-w-2xs",
    "rounded-2xl",
    "bg-slate-200",
    "p-2",
    "mt-2"
  );
  newElement.innerHTML = userInputCard1.value;
  const parent1 = document.querySelector(".list");
  if (userInputCard1.value.trim()) {
    parent1.insertBefore(newElement, userInputCard1);
  }
  userInputCard1.value = "";
}

addNewList.addEventListener("click", () => {
  if (userInputCard1.value == "") {
    addNewListByUser();
  } else {
    addUserInputList();
  }
});

userInputCard1.addEventListener("keydown", function (event) {
  if (event.key == "Enter" && userInputCard1.value.trim() !== "") {
    addUserInputList();
  }
});

function getBoardInfo(id) {
  fetch(
    `https://api.trello.com/1/boards/${id}?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((element) => {
      // store board info for SSOT
      state.boards[element.id] = element;
      // console.log(state);
      const body = document.querySelector("body");
      const imageUrl = element?.prefs?.backgroundImage;
      const bgColor = element?.prefs?.backgroundColor;

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
    })
    .catch((err) => console.error(err));
}

function getListInfo(id) {
  fetch(
    `https://api.trello.com/1/boards/${id}/lists?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((elements) => {
      main.innerHTML = "";
      elements?.forEach((element) => {
        state.lists[element.id] = element;
        // console.log(state);
        const htmlString = `
            <div class="list h-fit min-w-2xs rounded-2xl p-2 single-card bg-white border-2 flex flex-col">
                <input type="text" placeholder="${element?.name}" class="list-title w-45 px-4 py-2 h-7 placeholder:font-bold placeholder:text-black cursor-pointer focus:outline-none  focus:ring-2 focus:ring-blue-500">
                
                <!-- Card container -->

                <div class="card-wrapper flex flex-col gap-2 mt-2" data-id="${element.id}"></div>
                <textarea placeholder="Enter a title" class="user-input-card mt-1 hidden w-full overflow-hidden resize-none border font-light border-gray-300 p-2 rounded-md" rows="1" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"></textarea>
                <button class="card-button w-45 mt-2 h-10 pr-16 rounded-md cursor-pointer hover:bg-slate-300">+ Add a card</button>
                <div class="new-card-open flex gap-0.5 hidden font-light">
                <button class="add-card p-2 mt-2 h-10 rounded-md cursor-pointer font-[500] bg-blue-500 text-white">Add card</button>
                <button class="cross-button w-10 mt-2 rounded-md cursor-pointer hover:bg-slate-300">X</button>
                </div>
            </div>`;

        const list = getNode(htmlString);
        // ------ for delete butom -------
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️";
        // deleteBtn.classList = "absolute top-2 right-2 text-red-500 hover:text-red-700 z-10";
        deleteBtn.classList =
          "absolute top-2 right-6 text-red-500 hover:text-red-700 z-10 cursor-pointer";

        deleteBtn.onclick = () => deleteList(element.id, list);
        list.style.position = "relative";
        list.appendChild(deleteBtn);
        main.append(list);
        const addButton = list.querySelector(".card-button");
        addButton.addEventListener("click", () => {
          addNewCard(list);
        });
        listId = element.id;
        // console.log(listId);
        getAllCard(listId);
      });
      const btnString = `
          <div class="list h-fit min-w-2xs rounded-2xl single-card bg-white flex flex-col border-0">
            <textarea placeholder="Enter a title" class="user-input-card-1 hidden min-w-3xs m-2 overflow-hidden resize-none border font-light border-gray-300 p-2 rounded-md" rows="1" oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"></textarea>
            <button class="add-new-list cursor-pointer hover:bg-slate-300 h-12 min-w-3xs rounded-2xl bg-slate-200 p-2">+ Add another list</button>
            <div class="new-card-open-1 flex gap-0.5 hidden font-light min-w-2xs m-2 mt-0">
              <button class="add-list p-2 h-10 rounded-md cursor-pointer font-[500] bg-blue-500 text-white">Add card</button>
              <button class="cross-button-1 w-10 rounded-md cursor-pointer hover:bg-slate-300">X</button>
            </div>
          </div>`;

      const addlistbtn = getNode(btnString);
      console.log(addlistbtn);
      main.append(addlistbtn);
      const textarea = document.querySelector(".user-input-card-1");
      const addNewListbtn = document.querySelector(".add-new-list");

      addNewListbtn.addEventListener("click", () => {
        textarea.classList.remove("hidden");
        addNewListbtn.classList.add("hidden");
      });

      textarea.addEventListener("keydown", function (event) {
        if (event.key == "Enter") {
          addNewListbtn.classList.remove("hidden");
          generateListId(textarea.value, textarea);
        }
      });
    })
    .catch((err) => console.error(err));
}

function getAllCard(id) {
  // console.log("ggyjqdudu");
  fetch(
    `https://api.trello.com/1/lists/${id}/cards?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((elements) => {
      const cardWrapper = document.querySelector(`[data-id="${id}"]`);
      if (!cardWrapper) {
        console.error("No card wrapper found for list id:", id);
        return;
      }
      elements.forEach((ele) => {
        state.cards[ele.id] = ele;
        // console.log(state);
        const card = document.createElement("div");
        card.classList = "w-full p-4 flex rounded-2xl bg-slate-200";
        const input = document.createElement("input");
        input.type = "text";
        input.value = ele.name;
        input.classList = "w-full bg-transparent outline-none py-2";
        input.addEventListener("blur", () => {
          console.log("Edited name:", input.value);
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️"; // Or use an SVG
        deleteBtn.classList =
          "text-red-500 hover:text-red-700 cursor-pointer ml-2";
        deleteBtn.onclick = () => deleteCard(ele.id, card);

        card.appendChild(input);
        card.appendChild(deleteBtn);
        cardWrapper.appendChild(card);

        input.addEventListener("click", () => {
          createCheckList(ele.id, ele.name);
        });
      });
    })
    .catch((err) => console.error(err));
}

function updateCard(id, name) {
  const payload = {
    idBoard: boardId,
    closed: false,
    pos: "bottom",
    name,
  };

  fetch(
    `https://api.trello.com/1/cards/?idList=${id}&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )
    .then((response) => {
      console.log(`Response: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then((text) => console.log(text))
    .catch((err) => console.error(err));
}

async function generateListId(listName, textarea) {
  const response = await fetch(
    `https://api.trello.com/1/lists?name=${listName}&idBoard=${boardId}&pos=bottom&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "POST",
    }
  );
  const listId = await response.json();
  createList(listName, listId["id"], textarea);
}

function createList(listName, listId, textarea) {
  userInputCard1.classList.add("hidden");
  const newList = document.createElement("div");
  newList.classList.add(
    "list",
    "relative",
    "bg-slate-200",
    "min-w-3xs",
    "h-fit",
    "rounded-lg",
    "flex",
    "flex-col",
    "items-center",
    "p-3",
    "m-3",
    "hover:bg-slate-300"
  );
  newList.dataset.listId = listId;
  newList.innerHTML = listName;

  // Add delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  // deleteBtn.className = "absolute top-2 right-2 text-red-500 hover:text-red-700 z-10 ";
  deleteBtn.classList =
    "absolute top-2 right-2 text-red-500 hover:text-red-700 z-10 cursor-pointer";
  deleteBtn.onclick = () => deleteList(listId, newList);
  newList.appendChild(deleteBtn);

  const cardsList = document.createElement("div");
  cardsList.classList.add("cards", "w-[100%]");
  newList.appendChild(cardsList);

  const inputButton = document.createElement("input");
  inputButton.type = "text";
  inputButton.placeholder = "Enter a title or paste a link";
  inputButton.classList.add(
    "getInput",
    "w-[100%]",
    "bg-slate-100",
    "rounded-sm",
    "p-1",
    "m-1",
    "text-slate-600",
    "hidden"
  );
  inputButton.dataset.listId = listId;
  newList.appendChild(inputButton);

  const addCardButton = document.createElement("button");
  addCardButton.classList.add(
    "addCard",
    "text-slate-600",
    "cursor-pointer",
    "w-[95%]",
    "p-1"
  );
  addCardButton.innerHTML = "+ Add a card";
  addCardButton.dataset.listId = listId;
  newList.appendChild(addCardButton);
  textarea.value = "";
  main.insertBefore(newList, main.children[main.children.length - 2]);

  // location.reload();

  getListInfo(boardId);
}

function deleteList(listId, listElement) {
  fetch(
    `https://api.trello.com/1/lists/${listId}/closed?value=true&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error("Failed to delete list");
      listElement.remove();
      console.log(`List ${listId} archived.`);
    })
    .catch((err) => console.error("Error deleting list:", err));
}

function deleteCard(cardId, cardElement) {
  fetch(
    `https://api.trello.com/1/cards/${cardId}?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "DELETE",
    }
  )
    .then((response) => {
      if (response.ok) {
        cardElement.remove();
        console.log("Card deleted successfully");
      } else {
        console.error("Failed to delete card");
      }
    })
    .catch((err) => console.error("Error deleting card:", err));
}

function createCheckList(cardId, cardName) {
  const checkListBg = document.createElement("div");
  checkListBg.classList.add(
    "checkListBg",
    "fixed",
    "inset-0",
    "bg-black/75",
    "flex",
    "justify-center",
    "items-center",
    "z-[9999]"
  );

  const checkList = document.createElement("div");
  checkList.classList.add(
    "checkList",
    "bg-white",
    "p-4",
    "rounded",
    "w-2/3",
    "h-[600px]",
    "relative",
    "overflow-y-auto"
  );

  const closeButton = document.createElement("button");
  closeButton.classList.add(
    "absolute",
    "top-2",
    "right-2",
    "text-xl",
    "cursor-pointer"
  );

  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => checkListBg.remove();

  const checkTitle = document.createElement("h2");
  checkTitle.classList.add("text-xl", "font-bold", "mb-4");
  checkTitle.textContent = `Checklist for "${cardName}"`;

  // const progressWrapper = document.createElement("div");
  // progressWrapper.classList.add("w-full",
  //   "bg-gray-700",
  //   "rounded",
  //   "h-2",
  //   "mb-2"
  // );

  // // Progress bar itself
  // const progressBar = document.createElement("div");
  // progressBar.classList.add(
  //   "bg-green-500",
  //   "h-2",
  //   "rounded",
  //   "transition-all",
  //   "duration-300"
  // );
  // progressBar.style.width = "0%"; // Initial

  // // Append bar to wrapper
  // progressWrapper.appendChild(progressBar);

  const checklistContainer = document.createElement("div");
  checklistContainer.classList.add(
    "flex",
    "flex-col",
    "gap-2",
    "checklistContainer"
  );

  const input = document.createElement("input");
  input.placeholder = "Add checklist";
  input.classList.add("border", "p-2", "rounded", "w-full", "mt-8");

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add checklist";
  addBtn.classList.add(
    "bg-blue-500",
    "text-white",
    "px-4",
    "py-2",
    "rounded",
    "mt-1",
    "cursor-pointer"
  );

  addBtn.onclick = () => {
    if (input.value.trim() !== "") {
      PostAPICheckList(cardId, input.value, checklistContainer);
      input.value = "";
      ChecklistsCard(cardId, checklistContainer);
    }
  };

  checkList.append(
    closeButton,
    checkTitle,
    // progressWrapper,
    checklistContainer,
    input,
    addBtn
  );
  checkListBg.appendChild(checkList);
  document.body.appendChild(checkListBg);
  ChecklistsCard(cardId, checklistContainer);
}

function ChecklistsCard(id, checklistContainer) {
  // console.log("hg23qjhfajhejhge");
  fetch(
    `https://api.trello.com/1/cards/${id}/checklists?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((elements) => {
      elements.forEach((ele) => {
        state.checkList[ele.id] = ele;
        console.log(state);
        console.log(ele);
        if (ele.name.trim()) {
          const checkList = document.createElement("div");
          checkList.classList = "checkList flex flex-col border-0 rounded-md ";
          checkList.setAttribute("id", ele.id);

          const item = document.createElement("div");
          item.classList.add(
            "flex",
            "items-center",
            "gap-2",
            "text-2xl",
            "px-2",
            "mt-5"
          );

          const label = document.createElement("span");
          label.textContent = ele.name;

          const progressWrapper = document.createElement("div");
          progressWrapper.classList.add(
            "w-full",
            "bg-gray-700",
            "rounded",
            "h-2",
            "mb-2"
          );

          // Progress bar itself
          const progressBar = document.createElement("div");
          progressBar.classList.add(
            "bg-green-500",
            "h-2",
            "rounded",
            "transition-all",
            "duration-300"
          );
          progressBar.style.width = "0%"; // Initial

          // Append bar to wrapper
          progressWrapper.appendChild(progressBar);

          // add item button
          const addItemBtn = document.createElement("button");
          addItemBtn.textContent = "Add Item";
          addItemBtn.classList.add(
            "bg-blue-500",
            "text-white",
            "Justify-content",
            "px-4",
            "py-2",
            "rounded",
            "mt-1",
            "ml-[3%]",
            "cursor-pointer",
            "w-fit"
          );

          // div for input, submit and  cancel
          const div = document.createElement("div");
          div.classList.add("hidden");

          // add input box for add item
          const inputItem = document.createElement("input");
          inputItem.placeholder = "Add check Item";
          inputItem.classList.add(
            "border",
            "p-2",
            "rounded",
            "w-1/2",
            "mt-3",
            "ml-[3%]",
            "mr-[5%]"
          );

          // submit btn after click add item
          const submitBtn = document.createElement("button");
          submitBtn.innerText = "submit";
          submitBtn.id = "submit";
          submitBtn.className =
            "h-[100%] border-solid border-red border-slate-400 border-2 rounded-[10px] cursor-pointer bg-green-700 p-2 m-1 ";

          // cancel btn after click add item
          const cancelBtn = document.createElement("button");
          cancelBtn.className =
            "h-[100%] border-solid mr-0 border-red border-slate-400 border-2 rounded-[10px] cursor-pointer bg-red-700 p-2 m-1";
          cancelBtn.innerText = "cancel";

          cancelBtn.addEventListener("click", () => {
            div.classList.add("hidden");
            addItemBtn.classList.remove("hidden");
            inputItem.value = "";
          });

          submitBtn.addEventListener("click", (e) => {
            if (inputItem.value.trim() !== "") {
              console.log(e.target.parentElement.parentElement.id);
              addItemInChekList(
                e.target.parentElement.parentElement.id,
                inputItem.value,
                id,
                checklistContainer
              );
              // Add for bar
              // updateChecklistProgress(id);
            }
          });

          div.append(inputItem, submitBtn, cancelBtn);
          addItemBtn.addEventListener("click", () => {
            div.classList.remove("hidden");
            addItemBtn.classList.add("hidden");
          });

          const deleteItemBtn = document.createElement("button");
          deleteItemBtn.textContent = "🗑️";
          deleteItemBtn.classList.add(
            "text-red-500",
            "hover:text-red-700",
            "ml-auto",
            "cursor-pointer"
          );

          deleteItemBtn.addEventListener("click", () => {
            // item.remove();
            checkList.remove();
            deleteCheckList(ele.id);
            // Add for bar
            // updateChecklistProgress(ele.id);
          });

          const checkItems = document.createElement("div");
          ele.checkItems.map((checkItem) => {
            const singleItem = document.createElement("div");
            singleItem.classList = "flex bg-slate-50 gap-5 pl-8 pr-3 mt-2";

            state.checkItems[checkItem.id] = checkItem;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkItem.state == "complete"
              ? (checkbox.checked = true)
              : (checkbox.checked = false);

            checkbox.addEventListener("change", (e) => {
              let state = e.target.checked;
              toggleCheckItem(id, ele.id, checkItem.id, state);
              // Add for bar
              updateChecklistProgress(ele.id);
            });

            //checkbox cross

            if (checkbox.checked) {
              singleItem.classList.add("line-through", "text-slate-500");
            } else {
              singleItem.classList.remove("line-through", "text-slate-500");
            }

            checkbox.addEventListener("change", function () {
              
              const isChecked = checkbox.checked;
              //updateCheckItem(cardId, itemData.id, isChecked);
              if (isChecked) {
                singleItem.classList.add("line-through", "text-slate-500");
              } else {
                singleItem.classList.remove(
                  "line-through",
                  "text-slate-500"
                );
              }
              updateChecklistProgress(ele.id);
            });

            const itemName = document.createElement("div");
            itemName.textContent = checkItem.name;
            console.log();

            const deleteItemBtn = document.createElement("button");
            deleteItemBtn.textContent = "🗑️";
            deleteItemBtn.classList.add(
              "text-red-500",
              "hover:text-red-700",
              "ml-auto",
              "cursor-pointer"
            );
            deleteItemBtn.addEventListener("click", () => {
              // item.remove();
              //  updateChecklistProgress(ele.id);

               deleteCheckListItem(ele.id, checkItem.id);
              setTimeout(() => {
                
                updateChecklistProgress(ele.id);
              }, 0);
              singleItem.remove();
            });

            singleItem.append(checkbox, itemName, deleteItemBtn);
            checkItems.appendChild(singleItem);
          });
          checkList.appendChild(item);

          // add for bar
          checkList.appendChild(progressWrapper);
          checkList.appendChild(checkItems);
          item.append(label, deleteItemBtn);

          //   checkList.append(inputItem);
          checkList.append(div);
          //   checkList.append(submitBtn);
          //   checkList.append(cancelBtn);
          checkList.append(addItemBtn);

          checklistContainer.appendChild(checkList);
        }
         updateChecklistProgress(ele.id);
      });
      console.log(id);
     
    })
    .catch((err) => console.error(err));
}

function updateChecklistProgress(checklistId) {
  // Get the checklist element by ID
  // console.log(id)
  const checklistBlock = document.getElementById(checklistId);

  if (!checklistBlock) {
    // console.error(`Checklist with ID ${checklistId} not found`);
    return;
  }

  // Find all checkboxes within this checklist
  const checkboxes = checklistBlock.querySelectorAll('input[type="checkbox"]');
  const checked = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

  // Calculate percentage
  const percentage =
    checkboxes.length > 0 ? (checked.length / checkboxes.length) * 100 : 0;

  // Find the progress bar in this specific checklist
  const progressBar = checklistBlock.querySelector("div.bg-green-500");

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    console.log(
      `Updated progress bar for checklist ${checklistId} to ${percentage}%`
    );
  } else {
    console.error(`Progress bar not found in checklist ${checklistId}`);
  }
}

function PostAPICheckList(id, name, checklistContainer) {
  fetch(
    `https://api.trello.com/1/cards/${id}/checklists?name=${name}&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "POST",
      body: JSON.stringify(),
    }
  )
    .then((response) => response.text())
    .then((text) => console.log(text))
    .then(() => {
      [...checklistContainer.children].forEach((ele) => {
        checklistContainer.removeChild(ele);
      });
      ChecklistsCard(id, checklistContainer);
    })
    .catch((err) => console.error(err));
}

function deleteCheckList(id) {
  fetch(
    `https://api.trello.com/1/checklists/${id}?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "DELETE",
    }
  )
    .then((response) => {
      if (response.ok) {
        console.log("Card deleted successfully");
        delete state.checkItems[id];
        // console.log(state);
      } else {
        console.error("Failed to delete card");
      }
    })
    .catch((err) => console.error(err));
}

function deleteCheckListItem(id, idCheckItem) {
  fetch(
    `https://api.trello.com/1/checklists/${id}/checkItems/${idCheckItem}?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "DELETE",
    }
  )
    .then((response) => {
      if (response.ok) {
        console.log("Card deleted successfully");
      } else {
        console.error("Failed to delete card");
      }
    })
    .catch((err) => console.error(err));
}

function addItemInChekList(id, name, cardId, checklistContainer) {
  // idCard=cardId;
  fetch(
    `https://api.trello.com/1/checklists/${id}/checkItems?name=${name}&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "POST",
    }
  )
    .then((response) => {
      console.log(`Response: ${response.status} ${response.statusText}`);
      return response.json();
    })
    .then((checkItem) => {
      // document.createElement("div")
      state.checkItems[checkItem.id] = checkItem;
      console.log(state);
      //Add a bar

      document.querySelector(".checklistContainer").innerHTML = "";

      
      ChecklistsCard(cardId, checklistContainer);
      updateChecklistProgress(id)
    })
    .catch((err) => console.error(err));
}

function toggleCheckItem(idCard, idChecklist, idCheckItem, state) {
  console.log(
    `Toggling item ${idCheckItem} in checklist ${idChecklist} to ${
      state ? "complete" : "incomplete"
    }`
  );

  fetch(
    `https://api.trello.com/1/cards/${idCard}/checklist/${idChecklist}/checkItem/${idCheckItem}?state=${
      state ? "complete" : "incomplete"
    }&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
    }
  )
    .then((response) => {
      console.log(`Response: ${response.status} ${response.statusText}`);

      // Update the progress bar for this specific checklist
      updateChecklistProgress(idChecklist);

      return response.text();
    })
    .then((text) => console.log(text))
    .catch((err) => console.error(err));
}
// console.log(state);
