/// <reference path="../include/index.d.ts"/>
var ServerMessenger = (function () {
    function ServerMessenger() {
        this.m_Model = new Model();
        this.m_Port = {};
        this.InitListeners();
    }
    ServerMessenger.prototype.InitListeners = function () {
        var self = this;
        chrome.runtime.onConnect.addListener(function (port) {
            self.m_Port[port.name] = port;
            if (port.name == "filler") {
                self.InitFillerListener(port);
            }
            else if (port.name == "popup") {
                var doesExist = false;
                if (self.m_Domain) {
                    var dataset = self.m_Model.GetUserData(this.m_Domain);
                    if (dataset)
                        doesExist = true;
                }
                self.InitPopupListener(port);
                self.m_Port["popup"].postMessage({ DomainExists: { val: doesExist } });
            }
        });
    };
    ServerMessenger.prototype.InitFillerListener = function (port) {
        var self = this;
        port.onMessage.addListener(function (msg) {
            if (msg.Domain) {
                self.m_Domain = msg.Domain;
            }
        });
    };
    ServerMessenger.prototype.InitPopupListener = function (port) {
        var self = this;
        port.onMessage.addListener(function (msg) {
            if (msg.NewUserInfo && this.m_Domain) {
                var user = msg.Userinfo;
                self.m_Model.SaveUserData(this.m_Domain, user.Username, user.Password);
            }
            else if (msg.MasterPassword) {
                /*
                Authenticate();
                let credentials = Model.GetUserData(m_Domain);
                m_Port["filler"].postMessage({"credentials" : credentials});
                
                var dataset = Model.GetUserData(m_Domain);
                if (dataset)
                    m_Port["filler"].postMessage({"Credentials" : credentials});
                else
                {}
                Implement general error class.
            */
            }
        });
    };
    return ServerMessenger;
}());
var Model = (function () {
    function Model() {
    }
    Model.prototype.SaveUserData = function (domain, username, password) {
        var credentials = { "Username": username, "Password": password };
        chrome.storage.local.set({ domain: credentials }, function () {
            var lasterror = chrome.runtime.lastError;
            if (lasterror)
                console.log("Last error" + lasterror.message);
        });
    };
    Model.prototype.GetUserData = function (domain) {
        chrome.storage.local.get(domain, function (dataset) {
            var lasterror = chrome.runtime.lastError;
            if (lasterror) {
                console.log("Error retrieving value from storage" + lasterror.message);
                return null;
            }
            return dataset;
        });
    };
    Model.prototype.Authenticate = function (password) {
    };
    return Model;
}());
var messenger = new ServerMessenger();