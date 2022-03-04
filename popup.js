// 추가 버튼
let add_btn = document.getElementById("add_todo");

// 그래프 버튼
let graph_btn = document.getElementById("graph");

let todo_list = document.getElementById("todo_list");

// todo list 렌더
function render () {
    chrome.storage.sync.get("todos", (data) => {
        if(data.todos){
            if(data.todos.length != 0) {
                graph_btn.hidden = false;
            }

            data.todos.forEach((todo) => {
                create_todo(todo);
            });
        }
    })
}

// 이미 저장한 스케줄인지 확인
function check_time (todos, check_times) {
    let duple_time = false;
    let message = '';

    todos.forEach((todo) => {
        let todo_start_time = Number(todo.start_time.replace(":",""));
        let todo_end_time = Number(todo.end_time.replace(":",""));
        let check_start_time = Number(check_times[0].replace(":",""));
        let check_end_time = Number(check_times[1].replace(":",""));


        // 자기자신을 제외한 중복된 시간이 있는지 체크
        if(check_times[2] != todo.turn){
            if(todo_start_time <= check_start_time && todo_end_time >= check_start_time){
                duple_time = true;
                message = todo.todo;
            }else if (todo_start_time <= check_end_time && todo_end_time >= check_end_time){
                duple_time = true;
                message = todo.todo;
            }else if(check_start_time <= todo_start_time && check_end_time >= todo_start_time){
                duple_time = true;
                message = todo.todo;
            }else if(check_start_time <= todo_end_time && check_end_time >= todo_end_time){
                duple_time = true;
                message = todo.todo;
            }
        }
        
    });

    return [duple_time, message];
}

// 저장 함수
function save_todo (parent_node, save_update){
    let start_time = parent_node.childNodes[0].value;
    let end_time = parent_node.childNodes[1].value;
    let todo = parent_node.childNodes[2].value;

    // 시작 시간이 비었을 경우
    if(!start_time){
        alert('check first time');
        return;
    }

    // 종료 시간이 비었을 경우
    if(!end_time){
        alert('check end time');
        return;
    }

    // 할 일이 비었을 경우
    if(!todo){
        alert('check todo');
        return;
    }

    // 종료시간보다 시작시간이 더 큰 경우
    if(Number(start_time.replace(":","")) > Number(end_time.replace(":",""))){
        alert('check start time and end time');
        return;
    }

    // 몇번째인지 
    let turn = Number(parent_node.className.split(' ')[1]);
    let save_btn = event.target;
    let cancle_btn = parent_node.childNodes[4];
    let update_btn = parent_node.childNodes[5];
    let delete_btn = parent_node.childNodes[6];

    chrome.storage.sync.get("todos", (data) => {
        let todos;

        if(data.todos){
            let is_duple_time = check_time(data.todos, [start_time, end_time, turn]);
            if(is_duple_time[0]){
                alert(`It's already scheduled time. : ${is_duple_time[1]}`);
                return;
            }
        }
        

        // 저장일 경우
        if(save_update == 'save'){
            if(turn == 1){
                todos = [{start_time, end_time, todo, turn}];
            }else{
                data.todos.splice(turn-1, 0, {start_time, end_time, todo, turn});
                todos = data.todos;
            }
            add_btn.style.display = '';
            add_btn.childNodes[0].style.display = '';
            save_btn.hidden = true;
            cancle_btn.hidden = true;
            update_btn.hidden = false;
            delete_btn.hidden = false;
        }else{ // 업데이트일 경우
            data.todos.forEach((data) => {
                if(data.turn == turn){
                    data.start_time = start_time;
                    data.end_time = end_time;
                    data.todo = todo;
                }
            });
            todos = data.todos;
        }

        chrome.storage.sync.set({ todos });
        graph_btn.hidden = false;
        for(let i = 0; i < 3; i++){
            parent_node.childNodes[i].readOnly = true;
        }
    })
}

// 삭제 함수
function delete_todo () {
    let is_delete = confirm('Are you sure you want to delete?');
    if(is_delete){
        let turn = Number(event.target.parentElement.className.split(' ')[1]);
        let wrap_div  = event.target.parentElement;
        chrome.storage.sync.get("todos", (data) => {
            let todos = data.todos.filter((todo) => todo.turn != turn);
            chrome.storage.sync.set({todos});
            wrap_div.style.display = 'none';
            
            if(todos.length == 0){
                graph_btn.hidden = true;
            }
        });
    }
}

// todo element 생성
function create_todo (data) {
    let wrapper = document.createElement("div");
    wrapper.className = "todo_wrap " + (data ? data.turn : todo_list.childNodes.length);

    // 시작 시간
    let first_input = document.createElement("input");
    first_input.type = "time";
    first_input.className = "start_time";
    if(data){
        first_input.value = data.start_time;
        first_input.readOnly = true;
    }

    // 종료 시간 
    let seconde_input = document.createElement("input");
    seconde_input.type = "time";
    seconde_input.className = "end_time";
    if(data){
        seconde_input.value =data.end_time;
        seconde_input.readOnly = true;
    }

    // todo 내용
    let todo_input = document.createElement("textarea");
    todo_input.className = "todo";
    todo_input.setAttribute("rows","3");
    todo_input.setAttribute("cols","30");
    if(data){
        todo_input.value =  data.todo;
        todo_input.readOnly = true;
    }

    // 저장 버튼
    let save_btn = document.createElement("button");
    save_btn.className = "todo_save";
    save_btn.textContent = "save";
    save_btn.addEventListener('click', (event) => {
        let parent_node = event.target.parentElement;
        save_todo(parent_node, 'save');
    });

    // 취소 버튼
    let cancle_btn = document.createElement("button");
    cancle_btn.className = "todo_cancle";
    cancle_btn.textContent = "X";
    cancle_btn.addEventListener("click", (event) => {
        cancle_btn.parentNode.style.display = 'none';
        add_btn.style.display = '';
        add_btn.childNodes[0].style.display = '';
    })

    // 업데이트 버튼 
    let update_btn = document.createElement("button");
    update_btn.className = "todo_update";
    update_btn.textContent = 'update';
    update_btn.addEventListener('click', (event) => {

        if(update_btn.textContent == 'update'){
            update_btn.textContent = 'updated';
            first_input.readOnly = false;
            seconde_input.readOnly = false;
            todo_input.readOnly = false;
        }else{
            update_btn.textContent = 'update';
            save_todo(update_btn.parentNode, 'update');
        }

    }); 


    // 삭제 버튼
    let delete_btn = document.createElement("button");;
    delete_btn.className = "todo_delete";
    delete_btn.textContent = "delete";
    delete_btn.addEventListener('click', (event) => {
        delete_todo();
    }) 

    save_btn.hidden = data ? true : '';
    cancle_btn.hidden = data ? true : '';
    update_btn.hidden = data ? '' : true;
    delete_btn.hidden = data ? '' : true;


    wrapper.appendChild(first_input);
    wrapper.appendChild(seconde_input);
    wrapper.appendChild(todo_input);
    wrapper.appendChild(save_btn);
    wrapper.appendChild(cancle_btn);
    wrapper.appendChild(update_btn);
    wrapper.appendChild(delete_btn);

    todo_list.appendChild(wrapper);
}

// 추가 버튼 클릭 이벤트
add_btn.addEventListener("click", (event) => {
    create_todo();
    event.target.style.display = 'none'
});

graph_btn.addEventListener("click", (event) => {
    chrome.windows.create({'url' : 'graph.html', type : 'popup'}, function(window){

    })
});

render();