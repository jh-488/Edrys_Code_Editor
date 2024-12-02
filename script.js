const CONTENT =
"// Type code here...\n// Right click or Ctrl + S to upload your code.\n";
const EDITOR = "editor";
var sendMsgNext = true;
const client = new Date().getTime();
var editor = {};
let myFontSize = 13;

function identifier(id) {
    return id.replace(".", "_").replace("/", "__");
}

function run() {
    Edrys.sendMessage("run", "");
}

function initEditor({ id, content, language, theme }) {
    const editor_ = monaco.editor.create(document.getElementById(id), {
        value: content,
        language: language,
        theme: theme,
        automaticLayout: true,
        fontSize: myFontSize,
    });

    function save() {
        const value = editor_.getValue();

        if (sendMsgNext) {
            Edrys.sendMessage("update", JSON.stringify({ id, value, client }));
        } else {
            sendMsgNext = !sendMsgNext;
        }

        Edrys.setItem(`editorText_${id}`, value);
    }

    editor_.addAction({
        id: "upload-code",
        label: "Save & upload code...",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        precondition: null,
        keybindingContext: null,
        contextMenuGroupId: "navigation",
        contextMenuOrder: 0,
        run: function (ed) {
            save();
            //run()
            return null;
        },
    });

    editor_.addAction({
        id: "toggle-theme",
        label: "Toggle dark theme",
        precondition: null,
        keybindingContext: null,
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1,
        run: function (ed) {
        if (Edrys.module) {
            let _theme =
            Edrys.getItem("theme") == "vs-light" ? "vs-dark" : "vs-light";
            ed.updateOptions({
                theme: _theme,
            });
            Edrys.setItem("theme", _theme);
        }
        return null;
        },
    });

    editor_.onDidChangeModelContent(save);
    editor_.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);

    return editor_;
}

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            multiFileMode: null,
            filename: [],
        };
    },

    methods: {
        runCode() {
            run();
        },

        identifier(id) {
            return identifier(id);
        },

        init({ id, content, language, theme }) {
            if (typeof content === "string") {
                // in this case only a single file will be generated
                this.multiFileMode = false;
                editor = {};
                editor[this.identifier(id)] = initEditor({
                    id,
                    content,
                    language,
                    theme,
                });
            } else {
                this.multiFileMode = true;

                for (const name in content) {
                    this.filename.push(name);
                }
            }
        },

        initFiles({ id, content, language, theme }) {
            editor = {};

            for (const filename in content) {
                let id = this.identifier(filename);
                editor[id] = initEditor({
                    id,
                    content: content[filename],
                    language,
                    theme,
                });
            }
        },

        // reset the editor content to the starter code
        resetCode() {
            clearEditor();
        },

        // toggle editor theme
        toggleTheme() {
            const theme = Edrys.getItem("theme") == "vs-light" ? "vs-dark" : "vs-light";
            Edrys.setItem("theme", theme);
            
            changeTopBarBgColor(theme);

            for (const id in editor) {
                editor[id].updateOptions({
                    theme,
                });
            }
        },

        zoomIn() {
            myFontSize += 3;
            for (const id in editor) {
                editor[id].updateOptions({
                    fontSize: myFontSize,
                });
            }
        },

        zoomOut() {
            myFontSize -= 3;
            for (const id in editor) {
                editor[id].updateOptions({
                    fontSize: myFontSize,
                });
            }
        },

        updateEditorContent({ id, content }) {
            editor[this.identifier(id)].setValue(content);
        },
    },
});

const ui = app.mount("#app");

const appElement = document.getElementById("app");


Edrys.onReady(() => {
    const language = Edrys?.module?.config?.language || "cpp";
    const theme =
        Edrys?.module?.config?.theme ||
        (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "vs-dark"
        : "vs-light");

    //changeTopBarBgColor(theme);

    // if the challenge is time-restricted, the editor should be read-only, until the timer starts
    if (Edrys.module.challengeType === "time-restricted" || Edrys.module.challengeType === "multiplayer" || Edrys.module.challengeId === "missing-led") {
        disableEditor();
    }

    if (Edrys.module.config.file) {
        const content = Edrys.module.config.file;

        for (key in content) {
        content[key] =
            Edrys.getItem(`editorText_${identifier(key)}`) ||
            content[key] ||
            CONTENT;
        }

        ui.init({ id: "editor", content, language, theme });

        setTimeout(function () {
            ui.initFiles({ id: "editor", content, language, theme });
        }, 1000);

    } else {
        const content =
            Edrys.getItem(`editorText_${EDITOR}`) ||
            Edrys.module.config.editorText ||
            CONTENT;

        ui.init({ id: EDITOR, content, language, theme });
    }
});


// Functions to handle editor state
const clearEditor = () => {
    const content = Edrys.module.config.editorText || CONTENT;

    ui.updateEditorContent({ id: EDITOR, content: content });

    displayMessage("");
};

const disableEditor = () => {
    appElement.classList.add("disabled");
};

const enableEditor = () => {
    appElement.classList.remove("disabled");
};

// listen for messages from other modules
Edrys.onMessage(({ from, subject, body, module }) => {
    if (subject === "timer-started") {
        // change the editor to writable when the timer starts
        enableEditor();
    } else if (subject === "timer-ended") {
        // change the editor to read-only when the timer ends and reset starter code
        clearEditor();

        disableEditor();
    } else if (subject === "player-turn" && body === Edrys.liveUser.displayName) {
        clearEditor();

        // change the editor to writable when it's the player's turn
        enableEditor();
    } else if (subject === "player-turn" && body !== Edrys.liveUser.displayName) {
        disableEditor();
    } 
}, (promiscuous = true));

const displayMessage = (message) => {
    document.getElementById("server-messages").innerHTML = message;
};

// connect to the websocket server
var socket = new WebSocket(Edrys?.module?.serverURL || "ws://localhost:8080");

// Event listener to handle received WebSocket messages
socket.onmessage = (event) => {
    var data = JSON.parse(event.data);

    if (data.error) {
        Edrys.sendMessage("server-response", "Error: " + data.error);
        Edrys.sendMessage("continue-timer", "");
    } else if (data.testMessage) {
        if (data.testPassed) {
            Edrys.sendMessage(
                "server-response",
                `<p style='font-size: 2rem'>${data.testMessage} <i class='fa fa-circle-check' style='color: #63E6BE;'></i></p>`
            );

            // send winning message to the timer module
            Edrys.sendMessage("challenge-solved", "Challenge solved");
        } else {
            Edrys.sendMessage(
                "server-response",
                `<p style='font-size: 2rem'>${data.testMessage} <i class='fa fa-circle-xmark' style='color: #ff0000;'></i></p>`
            );
            Edrys.sendMessage("continue-timer", "");
        }
    } else {
        Edrys.sendMessage(
            "server-response",
            data.message + "\n" + (data.stdout ? data.stdout : data.stderr)
        );
        Edrys.sendMessage("continue-timer", "");
    }
};

Edrys.onMessage(({ from, subject, body }) => {
    switch (subject) {
        case "update":
            const b = JSON.parse(body);

            if (b.client == client) return;

            // console.log(b.client, client)

            sendMsgNext = false;
            editor[b.id].setValue(b.value);
            break;
        case "run":
            body = "";

            if (ui.multiFileMode) {
                let file = {};
                for (const name of ui.filename) {
                    file[name] = editor[identifier(name)].getValue();
                }

                body = JSON.stringify({ file });
            } else {
                body = editor[EDITOR].getValue();
            }

            if (Edrys.module.config.runCommand) {
                Edrys.sendMessage(Edrys.module.config.runCommand, body);
            }

            // show loader (and stop timer) while waiting for response
            Edrys.sendMessage("server-response", "<span class='loader'></span>");
            Edrys.sendMessage("pause-timer", "");

            if (Edrys.role === "station") {
                // send the code through socket if connected
                if (!socket || socket.readyState !== WebSocket.OPEN) {
                    Edrys.sendMessage("server-response", "Error: Server not connected!!");
                } else {
                    socket.send(
                        JSON.stringify({
                            code: body,
                            challengeId: Edrys.module.challengeId,
                        })
                    );
                }
            }

            break;
        // Event listener to handle WebSocket responses
        case "server-response":
            displayMessage(body);
        break;
    }
});


// Function to change the theme toggle container background color
const changeTopBarBgColor = (theme) => {
    const topBarContainer = document.querySelector(".top_bar_container");
    theme === "vs-light" ? topBarContainer.style.backgroundColor = "#fffffe" : topBarContainer.style.backgroundColor = "#1e1e1e";
};