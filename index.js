const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles().map(f => f.split('\r\n'));
const todos = getTODOs(files)
console.log('Please, write your command!');
readLine(processCommand);
function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    if (command === 'exit') {
        process.exit(0);
    } else if (command === 'show') {
        showSelection(todos);
    } else if (command === 'important') {
        showSelection(todos
            .filter(item => item.indexOf('!') !== -1));
    } else if (command.indexOf("user ") === 0) {
        let username = command.split(' ')[1].toLowerCase();
        let todos = todos
            .filter(
                todo => todo.username !== null && todo.username.toLowerCase() === username);

        showSelection(todos);
    } else if (command.indexOf("sort ") === 0) {
        let todos = getTODOs(files);
        let argument = command.split(' ')[1];

        if (argument === "importance") {
            showSelection(
                todos.sort((i1, i2) => -Compare(i1, i2, item => {
                    return item === null ? null : item.priority;
                }))
            )
        } else if (argument === "user") {
            showSelection(
                todos.sort((i1, i2) => Compare(i1, i2, item => {
                    return item === null ? null : item.username;
                })));
        } else if (argument === "date") {
            showSelection(
                todos.sort((i1, i2) => -Compare(i1, i2, item => {
                    return item === null ? null : item.date
                })));
        } else {
            console.log("wrong argument value");
        }
    } else if (command.indexOf('date') === 0) {
        let date = command.split(' ');
        showTodoAfterDate(date);
    }
    else {
        console.log('wrong command');
    }
}

function groupBy(arr, keySelector) {
    return arr.reduce((item, obj) => {
        let key = keySelector(item);
        if (!(key in obj))
            obj[key] = [];

        obj[key].push(item);
    }, {});
}

function showGroups(groups) {
    for (const key in groups) {
        showSelection(groups[key]);
    }
}

function showSelection(selection)
{
    for (const item of selection)
        console.log(item.toString());
}

function Compare(i1, i2, keySelector) {
    let [key1, key2] = [keySelector(i1), keySelector(i2)];

    if (key1 !== null && key2 !== null && key1 < key2)
        return -1;

    if (key1 === key2)
        return 0;

    return 1;
}

function showTodoAfterDate(date){
    let dt = new Date(date);
    let toShow = []
    for (let todo of todos) {
        if (todo.date <= dt)
            continue;
        toShow.push(todo);
    }
    showSelection(toShow);
}

function Todo(username, dateStr, text) {
    this.username = username;
    this.dateStr = dateStr;
    this.date = dateStr !== null ? new Date(dateStr) : null;
    this.text = text;
    this.priority = text.split("").filter(item => item === "!").length;

    this.toString = () => {
        let todoBody = [this.username, this.dateStr, this.text]
            .filter(item => item !== null)
            .join('; ');


        // DO NOT TOUCH LINE BREAKS!
        return "// TO" +
            "DO " + todoBody;
    }
}

function getTODOs(files){
    let todos = [];
    let re = /(\/\/ TODO .+?$)/;
    for (let file of files) {
        for (let line of file){
            let match = line.match(re);
            if (match === null)
                continue;
            let parse = match[0].split(';');
            if (parse.length < 3){
                todos.push(new Todo(null, null, match[0].slice(8)));
                continue;
            }
            let date = parse[1].trimStart();
            let name = parse[0].split(' ')[2];
            let text = parse[2].trimStart();
            todos.push(new Todo(name, date, text))
        }
    }
    return todos;
}
// TODO you can do it!
