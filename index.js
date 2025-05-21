
const boards = document.getElementById('boards'); 
const newBoard = document.getElementById('newBoard');
const body = document.querySelector('body');

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const handleClick=(id,projectName)=>{
    window.location.href=`lists.html?id=${id}&projectName=${encodeURIComponent(projectName)}`;
}

function render(){
    fetch("https://api.trello.com/1/organizations/6818442488f0bb03c666a6e4/boards?key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592", {
    method: "GET",
    headers: myHeaders
    })
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  // or response.text() / response.blob()
    })
    .then(data => {
        console.log('Response data:', data);
        
        data?.forEach(element => {
            const board = document.createElement('div');
            board.innerText = element?.name;
            board.className = 'border-solid bg-[#dcdfe4] h-45 w-55 rounded-2xl flex justify-center items-center cursor-pointer text-white text-2xl';

            const imageUrl = element?.prefs?.backgroundImage;
            const bgColor = element?.prefs?.backgroundColor;

            if (imageUrl) {
                board.style.backgroundImage = `url('${imageUrl}')`;
                board.style.backgroundSize = 'cover';
                board.style.backgroundPosition = 'center';
            } else if (bgColor) {
                board.style.backgroundColor = bgColor;
            } else {
                board.style.backgroundColor = '#dcdfe4'; // fallback color
            }
            boards.appendChild(board);
            board.addEventListener('click',()=>handleClick(element.id,element.name)); 
        });
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}
render();

newBoard.addEventListener('click',(e)=>{

    const outerBoard = document.createElement('div');
    outerBoard.classList = 'w-full h-full absolute left-0 top-0 bg-slate-400/70 flex justify-center items-center';
    body.appendChild(outerBoard);

    const innerBoard = document.createElement('div');
    innerBoard.classList = 'w-[300px] h-[250px] border-2 bg-white rounded-xl border-[#0b837b] ';
    outerBoard.appendChild(innerBoard);

    const userheader = document.createElement('h3');
    userheader.innerText = 'Board title :';
    userheader.classList = 'font-bold ml-3 mt-5';
    innerBoard.appendChild(userheader);

    const boardTitle = document.createElement('input');
    boardTitle.type = 'text';
    boardTitle.placeholder = 'user board title';
    boardTitle.id = 'userInput';
    boardTitle.classList = 'w-[90%] h-[20%] border-solid border-red m-[10px] ml-[13px] pl-2 border-slate-400 border-2 rounded-[10px]';
    innerBoard.appendChild(boardTitle);

    const userSubmit = document.createElement('div');
    userSubmit.classList = 'w-[90%] h-[20%] m-[10px] pl-2 border-slate-400 flex content-between gap-4 mt-5';
    innerBoard.appendChild(userSubmit);

    const submitBtn = document.createElement('button');
    submitBtn.innerText = 'submit';
    submitBtn.id = 'submit';
    submitBtn.classList = 'w-[50%] h-[100%] border-solid border-red border-slate-400 border-2 rounded-[10px] cursor-pointer hover:bg-green-700';
    userSubmit.appendChild(submitBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.classList = 'w-[50%] h-[100%] border-solid mr-0 border-red border-slate-400 border-2 rounded-[10px] cursor-pointer hover:bg-red-700';
    cancelBtn.innerText = 'cancel';
    userSubmit.appendChild(cancelBtn);

    const data = document.querySelector('#submit');
    data.addEventListener('click',()=>{

        const inputData = document.getElementById('userInput').value;
        if(!inputData) return;

        fetch(`https://api.trello.com/1/boards/?name=${inputData}&key=73354637abed21b50def50995536e02b&token=ATTA7e70d05849d226a3e69008961a3afb21371d106ccd22a9368eef72d88b2602bd43AA7592`, {
        method: 'POST'
        })
        .then(response => {
            console.log(
            `Response: ${response.status} ${response.statusText}`
            );
            return response.text();
        })
        .then(text => console.log(text))
        .catch(err => console.error(err));
        outerBoard.remove();
        // render();
        location.reload();
    });

    cancelBtn.addEventListener('click',()=>{
        outerBoard.remove();
    })
    // render();
});

