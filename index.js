
let defaultOptions = {
    env: "local",
    local: "http://localhost",
    staging: "https://staging-account.lodgecompliance.com",
    production: "https://account.lodgecompliance.com",
    local_port: "8080",
};
const LodgeCompliance = function(defaultOptions) {
    const style = {
        "local": "http://localhost:5000/guestregistration-4140a/us-central1/assets/css/lc.css",
        "staging": "https://staging-assets.lodgecompliance.com/css/lc.css",
        "production": "https://assets.lodgecompliance.com/css/lc.css"
    }[env];
    // Build full path if env is local
    if (env === "local") {
        defaultOptions.local = `${defaultOptions.local}:${defaultOptions.local_port}`
    }
    this.domain = defaultOptions[env];
    this.container = document.createElement("div");
    this.frame =  document.createElement("iframe");
    util.loadStyle(style).then(() => {
        this.container.setAttribute("class", "lc-frame-container");
        this.frame.setAttribute("class", "lc-frame");
        this.container.append(this.frame);
        document.body.append(this.container);
    }).catch(e => {
        console.log(`Error loading auth styles`)
    })
}

LodgeCompliance.prototype.authenticate = function(params = {}) {
    return new Promise((resolve, reject) => {
        params = params || {};
        params.referrer = window.location.href
        this.show(`auth?${new URLSearchParams(params).toString()}`);
        window.onmessage =  (e) => {
            if (e.origin === this.domain) {
                let { type, token, profile, status } = e.data;
                if(type === "auth" && status === "signedin") {
                    this.hide()
                    resolve({ token, profile})
                }
            }
        }
    })
}

LodgeCompliance.prototype.show = function(path) {
    this.container.setAttribute(`show`, true)
    this.frame.setAttribute("src", this.link(path))
}
LodgeCompliance.prototype.hide = function() {
    this.container.removeAttribute(`show`)
}
LodgeCompliance.prototype.signout = function() {
    window.location.replace(this.link(`signout?redirect=${window.location.href}`))
}
LodgeCompliance.prototype.link = function(path) {
    return `${this.domain}/${path}`
}
const util = {
    loadStyle: function(url) {
        // eslint-disable-next-line consistent-return
        return new Promise((res, rej) => {
            if(document.querySelector(`link[href='${url}']`)) {
                return res();
            }
            const style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("type", "text/css");
            style.setAttribute("href", url);
            document.head.appendChild(style);
            style.onload = () => res();
            style.onerror = () => rej(new Error("Error loading style"));
        });
    }
}

window.LodgeCompliance = LodgeCompliance