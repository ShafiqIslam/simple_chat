(function() {
    var socket = io.connect('http://localhost:3000');
    var namecontainer = document.getElementById("namecontainer");
    var nameInput = document.getElementById("username");

    var chatcontainer = document.getElementById("chatcontainer");
    var messageBox = document.getElementById("messagebox");
    var chatWindow = document.getElementById("chatwindow");

    var onlineUsersList = document.getElementById("onlineUsersList");

    var myUserName = "";
    var targetUserName = "";

    function addMessage(data) {
        chatWindow.innerHTML += "<p><b>" + data.username + ":</b> " + data.msg + "</p>";
    }

    function addUser(name) {
        onlineUsersList.innerHTML += "<li>" + name + "</li>";
    }

    nameInput.addEventListener('keypress', function(e) {
        if (e.keyCode != 13)
            return;
        e.preventDefault();
        if (this.value == "")
            return;

        var data = {
            "name": this.value
        };
        socket.emit('NewUser', data, function(not_exist) {
            if(not_exist) {
                namecontainer.style.display = "none";
                chatcontainer.style.display = "block";
                myUserName = data.name;
            } else {
                this.value == "";
                document.getElementById("usernameError").style.display = "inline-block";
            }
        });
    });

    messageBox.addEventListener('keypress', function(e) {
        if (e.keyCode != 13)
            return;
        e.preventDefault();
        if (this.value == "")
            return;

        socket.emit('SendMessage', {
            "msg": this.value,
            "targetUserName": targetUserName
        });

        addMessage({
            "username": myUserName, 
            "msg": this.value
        });

        this.value = "";
    });

    document.querySelector('body').addEventListener('click', function(event) {
        if (event.target.tagName.toLowerCase() === 'li') {
            for (i = 0; i < onlineUsersList.childNodes.length; i++) {
                onlineUsersList.childNodes[i].style.color = "black";
            }
            event.target.style.color = "red";
            targetUserName = event.target.innerHTML;
        }

        if(event.target.id == "clear") {
            for (i = 0; i < onlineUsersList.childNodes.length; i++) {
                onlineUsersList.childNodes[i].style.color = "black";
            }
            targetUserName = "";
        }
    });

    socket.on('NewMessage', function(data) {
        addMessage(data);
    });

    socket.on('NewUserJoined', function(data) {
        var html = "";
        for (var i = 0; i < data.length; i++) {
            html += "<li>" + data[i] + "</li>";
        }

        onlineUsersList.innerHTML = html;
    });
})();
