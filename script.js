(function () {
  "use strict";

  /* ==============================================================
     CONFIGURATION
  ============================================================== */

  const DEFAULT_GRAFANA_URL =
    "https://dev.pirsch.io/?domain=pirsch.io&interval=14d&ui=hide";

  const RuntimeConfig = {
    grafanaEmbedUrl: DEFAULT_GRAFANA_URL,
    customer: null
  };


  /* ==============================================================
     DEMO MONITORING DATA
     Temporary until Zabbix integration is available
  ============================================================== */

  const DemoMonitoringData = {

    domain: {
      name: "precision-demo.com",
      expiry: "2026-12-31",
      daysRemaining: 118
    },

    servers: [
      {
        name: "Web Server",
        status: "Operational",
        cpu: "42%",
        memory: "58%"
      },
      {
        name: "Database Server",
        status: "Operational",
        cpu: "61%",
        memory: "72%"
      },
      {
        name: "Application Server",
        status: "Warning",
        cpu: "84%",
        memory: "68%"
      }
    ],

    alerts: [
      {
        severity: "Warning",
        message: "Application Server CPU usage is above 80%."
      }
    ],

    logs: [
      "[2026-09-04 09:10:02] INFO Web Server monitoring started",
      "[2026-09-04 09:12:15] INFO CPU usage: 42%",
      "[2026-09-04 09:15:41] WARNING Application Server CPU usage: 84%",
      "[2026-09-04 09:18:22] INFO Database connection healthy",
      "[2026-09-04 09:20:30] INFO All critical services operational"
    ]
  };


  /* ==============================================================
     AUTH MODULE
  ============================================================== */

  const AuthModule = (function () {

    let session = null;

    function deriveName(email) {

      const local = email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .trim();

      if (!local) {
        return "Customer User";
      }

      return local
        .split(" ")
        .map(word =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
        )
        .join(" ");
    }


    return {

      mockLogin(email, password) {

        return new Promise((resolve, reject) => {

          setTimeout(() => {

            if (!email || !password || password.length < 4) {

              reject(
                new Error(
                  "Invalid email or password. Please try again."
                )
              );

              return;
            }


            session = {

              name: deriveName(email),

              email: email,

              role: "Customer",

              customer: {
                id: "cust_demo",
                name: "Precision Informatics"
              }
            };


            RuntimeConfig.customer =
              session.customer;

            RuntimeConfig.grafanaEmbedUrl =
              DEFAULT_GRAFANA_URL;

            resolve(session);

          }, 700);

        });

      },


      logout() {
        session = null;
      },


      getSession() {
        return session;
      }

    };

  })();


  /* ==============================================================
     THEME
  ============================================================== */

  const ThemeModule = (function () {

    let current = "light";


    function apply(theme) {

      current = theme;

      document.documentElement.setAttribute(
        "data-theme",
        theme
      );


      const lightButton =
        document.getElementById(
          "theme-light-btn"
        );

      const darkButton =
        document.getElementById(
          "theme-dark-btn"
        );


      if (lightButton) {

        lightButton.classList.toggle(
          "active",
          theme === "light"
        );

      }


      if (darkButton) {

        darkButton.classList.toggle(
          "active",
          theme === "dark"
        );

      }


      syncSettingsToggle();

    }


    return {

      apply,

      get() {
        return current;
      }

    };

  })();


  /* ==============================================================
     DOM ELEMENTS
  ============================================================== */

  const loginScreen =
    document.getElementById("login-screen");

  const appScreen =
    document.getElementById("app-screen");

  const loginForm =
    document.getElementById("login-form");

  const emailInput =
    document.getElementById("email");

  const pwInput =
    document.getElementById("password");

  const emailError =
    document.getElementById("email-error");

  const pwError =
    document.getElementById("password-error");

  const formAlert =
    document.getElementById("form-alert");

  const formAlertText =
    document.getElementById("form-alert-text");

  const loginBtn =
    document.getElementById("login-btn");

  const loginBtnText =
    document.getElementById("login-btn-text");

  const contentInner =
    document.getElementById("content-inner");

  const navItems =
    document.querySelectorAll(
      ".nav-item[data-route]"
    );


  /* ==============================================================
     YEAR
  ============================================================== */

  const yearElement =
    document.getElementById("year");

  if (yearElement) {

    yearElement.textContent =
      new Date().getFullYear();

  }


  /* ==============================================================
     PASSWORD TOGGLE
  ============================================================== */

  const togglePasswordButton =
    document.getElementById("toggle-pw");

  if (togglePasswordButton && pwInput) {

    togglePasswordButton.addEventListener(
      "click",
      function () {

        const isPassword =
          pwInput.type === "password";

        pwInput.type =
          isPassword
            ? "text"
            : "password";

        this.setAttribute(
          "aria-label",
          isPassword
            ? "Hide password"
            : "Show password"
        );

      }
    );

  }


  /* ==============================================================
     FORGOT PASSWORD
  ============================================================== */

  const forgotLink =
    document.getElementById("forgot-link");

  if (forgotLink) {

    forgotLink.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        if (formAlertText) {

          formAlertText.textContent =
            "Password reset is not available in this demo.";

        }

        if (formAlert) {

          formAlert.classList.add("show");

        }

      }
    );

  }


  /* ==============================================================
     DEMO LOGIN
  ============================================================== */

  const demoButton =
    document.getElementById("demo-fill-btn");

  if (demoButton) {

    demoButton.addEventListener(
      "click",
      function () {

        if (emailInput) {

          emailInput.value =
            "demo@precisionit.co.in";

        }

        if (pwInput) {

          pwInput.value =
            "demo1234";

        }

        attemptLogin();

      }
    );

  }


  /* ==============================================================
     LOGIN EVENTS
  ============================================================== */

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        attemptLogin();

      }
    );

  }


  if (loginBtn) {

    loginBtn.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        attemptLogin();

      }
    );

  }


  if (emailInput) {

    emailInput.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {

          event.preventDefault();

          attemptLogin();

        }

      }
    );

  }


  if (pwInput) {

    pwInput.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {

          event.preventDefault();

          attemptLogin();

        }

      }
    );

  }


  /* ==============================================================
     LOGIN FUNCTION
  ============================================================== */

  function attemptLogin() {

    let valid = true;


    if (formAlert) {

      formAlert.classList.remove("show");

    }


    if (emailInput) {

      emailInput.classList.remove("error");

    }

    if (pwInput) {

      pwInput.classList.remove("error");

    }


    if (emailError) {

      emailError.classList.remove("show");

    }

    if (pwError) {

      pwError.classList.remove("show");

    }


    if (!emailInput ||
      !emailInput.value.trim()) {

      valid = false;

      if (emailInput) {

        emailInput.classList.add("error");

      }

      if (emailError) {

        emailError.classList.add("show");

      }

    }


    if (!pwInput ||
      !pwInput.value ||
      pwInput.value.length < 4) {

      valid = false;

      if (pwInput) {

        pwInput.classList.add("error");

      }

      if (pwError) {

        pwError.textContent =
          "Enter a password with at least 4 characters.";

        pwError.classList.add("show");

      }

    }


    if (!valid) {
      return;
    }


    if (loginBtn) {

      loginBtn.disabled = true;

    }


    if (loginBtnText) {

      loginBtnText.innerHTML =
        '<span class="spinner"></span>';

    }


    AuthModule
      .mockLogin(
        emailInput.value.trim(),
        pwInput.value
      )

      .then(session => {

        enterApp(session);

      })

      .catch(error => {

        if (formAlertText) {

          formAlertText.textContent =
            error.message;

        }

        if (formAlert) {

          formAlert.classList.add("show");

        }

        if (loginBtn) {

          loginBtn.disabled = false;

        }

        if (loginBtnText) {

          loginBtnText.textContent =
            "Sign in";

        }

      });

  }


  /* ==============================================================
     ENTER APPLICATION
  ============================================================== */

  function enterApp(session) {

    if (loginScreen) {

      loginScreen.classList.add("hidden");

    }

    if (appScreen) {

      appScreen.classList.remove("hidden");

    }


    if (loginBtn) {

      loginBtn.disabled = false;

    }

    if (loginBtnText) {

      loginBtnText.textContent =
        "Sign in";

    }


    if (loginForm) {

      loginForm.reset();

    }


    const initials =
      session.name
        .split(" ")
        .map(word => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();


    const avatar =
      document.getElementById(
        "avatar-initials"
      );

    if (avatar) {

      avatar.textContent =
        initials || "U";

    }


    const profileName =
      document.getElementById(
        "profile-name"
      );

    if (profileName) {

      profileName.textContent =
        session.name;

    }


    const ddName =
      document.getElementById("dd-name");

    if (ddName) {

      ddName.textContent =
        session.name;

    }


    const ddEmail =
      document.getElementById("dd-email");

    if (ddEmail) {

      ddEmail.textContent =
        session.email;

    }


    const profileRole =
      document.getElementById(
        "profile-role"
      );

    if (profileRole) {

      profileRole.textContent =
        "Customer · Precision Informatics";

    }


    Router.go("dashboard");

  }


  /* ==============================================================
     LOGOUT
  ============================================================== */

  function exitApp() {

    AuthModule.logout();

    if (appScreen) {

      appScreen.classList.add("hidden");

    }

    if (loginScreen) {

      loginScreen.classList.remove("hidden");

    }

  }


  const logoutButton =
    document.getElementById("logout-btn");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      exitApp
    );

  }


  const sidebarLogout =
    document.getElementById("sidebar-logout");

  if (sidebarLogout) {

    sidebarLogout.addEventListener(
      "click",
      exitApp
    );

  }


  /* ==============================================================
     THEME BUTTONS
  ============================================================== */

  const lightThemeButton =
    document.getElementById(
      "theme-light-btn"
    );

  const darkThemeButton =
    document.getElementById(
      "theme-dark-btn"
    );


  if (lightThemeButton) {

    lightThemeButton.addEventListener(
      "click",
      () => ThemeModule.apply("light")
    );

  }


  if (darkThemeButton) {

    darkThemeButton.addEventListener(
      "click",
      () => ThemeModule.apply("dark")
    );

  }


  ThemeModule.apply("light");


  /* ==============================================================
     PROFILE DROPDOWN
  ============================================================== */

  const profileTrigger =
    document.getElementById(
      "profile-trigger"
    );

  const profileDropdown =
    document.getElementById(
      "profile-dropdown"
    );


  if (profileTrigger && profileDropdown) {

    profileTrigger.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        profileDropdown.classList.toggle(
          "open"
        );

      }
    );


    document.addEventListener(
      "click",
      () => {

        profileDropdown.classList.remove(
          "open"
        );

      }
    );

  }


  if (profileDropdown) {

    profileDropdown
      .querySelectorAll("[data-route]")
      .forEach(element => {

        element.addEventListener(
          "click",
          event => {

            event.preventDefault();

            Router.go(
              element.dataset.route
            );

          }
        );

      });

  }


  /* ==============================================================
     SIDEBAR
  ============================================================== */

  const sidebar =
    document.getElementById("sidebar");

  const scrim =
    document.getElementById("scrim");

  const sidebarToggle =
    document.getElementById(
      "sidebar-toggle"
    );


  function isMobile() {

    return window.innerWidth <= 880;

  }


  if (sidebarToggle) {

    sidebarToggle.addEventListener(
      "click",
      () => {

        if (!sidebar) return;


        if (isMobile()) {

          sidebar.classList.toggle(
            "mobile-open"
          );

          if (scrim) {

            scrim.classList.toggle(
              "show"
            );

          }

        } else {

          sidebar.classList.toggle(
            "collapsed"
          );

        }

      }
    );

  }


  if (scrim && sidebar) {

    scrim.addEventListener(
      "click",
      () => {

        sidebar.classList.remove(
          "mobile-open"
        );

        scrim.classList.remove(
          "show"
        );

      }
    );

  }


  /* ==============================================================
     PAGE TEMPLATES
  ============================================================== */

  const pages = {


    /* ==========================================================
       DASHBOARD
    ========================================================== */

    dashboard() {

      const url =
        RuntimeConfig.grafanaEmbedUrl;


      return `

        <div class="page-head">

          <h1>MaaS Dashboard</h1>

          <p>
            Real-time infrastructure monitoring and insights.
          </p>

        </div>


        <div class="dash-frame-card">

          <div class="dash-frame-toolbar">

            <div class="left">

              <span class="status-chip">
                <span class="d"></span>
                Live
              </span>

            </div>


            <button
              class="icon-btn"
              id="refresh-dash"
              title="Refresh Dashboard">

              ↻

            </button>

          </div>


          <div class="dash-frame-body">

            ${url ? `

              <div class="iframe-wrapper">

                <iframe
                  id="grafana-dashboard"
                  class="grafana-dashboard"
                  src="${url}"
                  title="MaaS Monitoring Dashboard"
                  frameborder="0"
                  loading="lazy">

                </iframe>

              </div>

            ` : `

              <div class="dash-frame-empty">

                <h3>
                  No dashboard connected yet
                </h3>

                <p>
                  Your monitoring dashboard will appear here once configured.
                </p>

              </div>

            `}

          </div>

        </div>

      `;

    },


    /* ==========================================================
       CHATBOT
    ========================================================== */

    chatbot() {

      return `

        <div class="page-head">

          <h1>MaaS Assistant</h1>

          <p>
            Ask questions about your infrastructure and monitoring data.
          </p>

        </div>


        <div class="chatbot-page">


          <div class="chatbot-header">

            <div>

              <h3>
                MaaS Monitoring Assistant
              </h3>

              <p>
                Ask about servers, CPU usage, alerts, domain expiry or logs.
              </p>

            </div>


            <span class="status-chip">

              <span class="d"></span>

              Online

            </span>

          </div>


          <div
            id="chat-messages"
            class="chat-messages">


            <div class="chat-message bot">

              <div class="chat-avatar">
                AI
              </div>


              <div class="chat-bubble">

                Hello! 👋

                <br><br>

                I can help you check:

                <br><br>

                • Server status<br>
                • CPU usage<br>
                • Active alerts<br>
                • Domain expiry<br>
                • Download monitoring logs

              </div>

            </div>


          </div>


          <div class="chat-suggestions">

            <button
              class="chat-suggestion"
              data-question="What is the server status?">

              Server status

            </button>


            <button
              class="chat-suggestion"
              data-question="Show CPU usage">

              CPU usage

            </button>


            <button
              class="chat-suggestion"
              data-question="Show active alerts">

              Active alerts

            </button>


            <button
              class="chat-suggestion"
              data-question="When does the domain expire?">

              Domain expiry

            </button>


            <button
              class="chat-suggestion"
              data-question="Download logs">

              Download logs

            </button>

          </div>


          <div class="chat-input-area">

            <input
              type="text"
              id="chat-input"
              placeholder="Ask about your monitoring environment..."
              autocomplete="off">


            <button
              id="chat-send-btn"
              class="chat-send-btn">

              Send

            </button>

          </div>


        </div>

      `;

    },


    /* ==========================================================
       PROFILE
    ========================================================== */

    profile() {

      const session =
        AuthModule.getSession();


      return `

        <div class="page-head">

          <h1>My Profile</h1>

          <p>
            Your MaaS Dashboard account details.
          </p>

        </div>


        <div class="settings-card">

          <h3>Account</h3>


          <div class="settings-row">

            <div>

              <div class="label">
                Name
              </div>

            </div>

            <div>
              ${session ? session.name : "—"}
            </div>

          </div>


          <div class="settings-row">

            <div>

              <div class="label">
                Email
              </div>

            </div>

            <div>
              ${session ? session.email : "—"}
            </div>

          </div>


          <div class="settings-row">

            <div>

              <div class="label">
                Role
              </div>

            </div>

            <div>
              ${session ? session.role : "—"}
            </div>

          </div>


        </div>

      `;

    },


    /* ==========================================================
       SETTINGS
    ========================================================== */

    settings() {

      return `

        <div class="page-head">

          <h1>Settings</h1>

          <p>
            Preferences for your MaaS Dashboard account.
          </p>

        </div>


        <div class="settings-card">

          <h3>Appearance</h3>

          <p>
            Choose your preferred theme.
          </p>


          <div class="settings-row">

            <div>

              <div class="label">
                Theme
              </div>

              <div class="desc">
                Light or dark mode
              </div>

            </div>


            <div class="theme-toggle">

              <button
                id="theme-light-btn-2">

                ☀

              </button>


              <button
                id="theme-dark-btn-2">

                🌙

              </button>

            </div>

          </div>


        </div>

      `;

    }

  };


  /* ==============================================================
     IMPORTANT ROUTE ALIAS
     Supports both:
     data-route="assistant"
     data-route="chatbot"
  ============================================================== */

  pages.assistant =
    pages.chatbot;


  /* ==============================================================
     ROUTER
  ============================================================== */

  const Router = {

    go(route) {

      /* Convert assistant route to chatbot */

      if (route === "assistant") {

        route = "chatbot";

      }


      /* Default route */

      if (!pages[route]) {

        route = "dashboard";

      }


      if (!contentInner) return;


      /* Load page */

      contentInner.innerHTML =
        pages[route]();


      /* Sidebar active item */

      navItems.forEach(item => {

        const itemRoute =
          item.dataset.route;


        item.classList.toggle(

          "active",

          itemRoute === route ||

          (
            route === "chatbot" &&
            itemRoute === "assistant"
          )

        );

      });


      /* Close mobile sidebar */

      if (
        isMobile() &&
        sidebar &&
        scrim
      ) {

        sidebar.classList.remove(
          "mobile-open"
        );

        scrim.classList.remove(
          "show"
        );

      }


      contentInner.scrollTop = 0;

      window.scrollTo(0, 0);


      /* Dashboard refresh */

      const refreshButton =
        document.getElementById(
          "refresh-dash"
        );

      if (refreshButton) {

        refreshButton.addEventListener(
          "click",
          () => Router.go("dashboard")
        );

      }


      /* Settings theme buttons */

      const lightButton =
        document.getElementById(
          "theme-light-btn-2"
        );

      const darkButton =
        document.getElementById(
          "theme-dark-btn-2"
        );


      if (lightButton) {

        lightButton.addEventListener(
          "click",
          () => ThemeModule.apply("light")
        );

      }


      if (darkButton) {

        darkButton.addEventListener(
          "click",
          () => ThemeModule.apply("dark")
        );

      }


      /* Initialize chatbot */

      if (route === "chatbot") {

        initializeChatbot();


        const chatInput =
          document.getElementById(
            "chat-input"
          );


        if (chatInput) {

          setTimeout(() => {

            chatInput.focus();

          }, 100);

        }

      }


      syncSettingsToggle();

    }

  };


  /* ==============================================================
     CHATBOT INITIALIZATION
  ============================================================== */

  function initializeChatbot() {

    const chatInput =
      document.getElementById(
        "chat-input"
      );

    const sendButton =
      document.getElementById(
        "chat-send-btn"
      );


    if (sendButton) {

      sendButton.addEventListener(
        "click",
        sendChatMessage
      );

    }


    if (chatInput) {

      chatInput.addEventListener(
        "keydown",
        event => {

          if (event.key === "Enter") {

            event.preventDefault();

            sendChatMessage();

          }

        }
      );

    }


    document
      .querySelectorAll(
        ".chat-suggestion"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const question =
              button.dataset.question;

            processChatQuestion(
              question
            );

          }
        );

      });

  }


  /* ==============================================================
     SEND CHAT MESSAGE
  ============================================================== */

  function sendChatMessage() {

    const input =
      document.getElementById(
        "chat-input"
      );


    if (!input) return;


    const question =
      input.value.trim();


    if (!question) return;


    input.value = "";


    processChatQuestion(
      question
    );

  }


  /* ==============================================================
     PROCESS QUESTION
  ============================================================== */

  function processChatQuestion(question) {

    addChatMessage(
      escapeHTML(question),
      "user"
    );


    setTimeout(() => {

      const answer =
        getChatbotAnswer(question);


      addChatMessage(
        answer.text,
        "bot"
      );


      if (
        answer.type === "download"
      ) {

        downloadDemoLogs();

      }

    }, 400);

  }


  /* ==============================================================
     ADD CHAT MESSAGE
  ============================================================== */

  function addChatMessage(
    message,
    sender
  ) {

    const messages =
      document.getElementById(
        "chat-messages"
      );


    if (!messages) return;


    const messageElement =
      document.createElement("div");


    messageElement.className =
      "chat-message " + sender;


    if (sender === "bot") {

      messageElement.innerHTML = `

        <div class="chat-avatar">
          AI
        </div>

        <div class="chat-bubble">
          ${message}
        </div>

      `;

    }

    else {

      messageElement.innerHTML = `

        <div class="chat-bubble">
          ${message}
        </div>

      `;

    }


    messages.appendChild(
      messageElement
    );


    messages.scrollTop =
      messages.scrollHeight;

  }


  /* ==============================================================
     CHATBOT RESPONSE ENGINE
  ============================================================== */

  function getChatbotAnswer(question) {

    const text =
      question.toLowerCase();


    /* DOMAIN EXPIRY */

    if (
      text.includes("domain") &&
      (
        text.includes("expiry") ||
        text.includes("expire")
      )
    ) {

      return {

        text: `

          <strong>Domain Information</strong>

          <br><br>

          Domain:
          ${DemoMonitoringData.domain.name}

          <br>

          Expiry Date:
          ${DemoMonitoringData.domain.expiry}

          <br>

          Days Remaining:
          ${DemoMonitoringData.domain.daysRemaining} days

        `

      };

    }


    /* SERVER STATUS */

    if (
      text.includes("server") ||
      text.includes("status") ||
      text.includes("health")
    ) {

      const servers =
        DemoMonitoringData.servers
          .map(server => `

            <strong>
              ${server.name}
            </strong>:
            ${server.status}

          `)
          .join("<br>");


      return {

        text: `

          <strong>
            Server Status
          </strong>

          <br><br>

          ${servers}

        `

      };

    }


    /* CPU */

    if (
      text.includes("cpu") ||
      text.includes("processor")
    ) {

      const cpu =
        DemoMonitoringData.servers
          .map(server => `

            <strong>
              ${server.name}
            </strong>:
            ${server.cpu}

          `)
          .join("<br>");


      return {

        text: `

          <strong>
            CPU Usage
          </strong>

          <br><br>

          ${cpu}

        `

      };

    }


    /* MEMORY */

    if (
      text.includes("memory") ||
      text.includes("ram")
    ) {

      const memory =
        DemoMonitoringData.servers
          .map(server => `

            <strong>
              ${server.name}
            </strong>:
            ${server.memory}

          `)
          .join("<br>");


      return {

        text: `

          <strong>
            Memory Usage
          </strong>

          <br><br>

          ${memory}

        `

      };

    }


    /* ALERTS */

    if (
      text.includes("alert") ||
      text.includes("problem") ||
      text.includes("warning")
    ) {

      const alerts =
        DemoMonitoringData.alerts
          .map(alert => `

            <strong>
              ${alert.severity}
            </strong>:
            ${alert.message}

          `)
          .join("<br>");


      return {

        text: `

          <strong>
            Active Alerts
          </strong>

          <br><br>

          ${alerts}

        `

      };

    }


    /* DOWNLOAD LOGS */

    if (
      text.includes("download") &&
      text.includes("log")
    ) {

      return {

        type: "download",

        text: `

          Your monitoring logs are being prepared
          for download.

        `

      };

    }


    /* LOGS */

    if (
      text.includes("log")
    ) {

      return {

        text: `

          I can prepare monitoring logs for download.

          <br><br>

          Try:

          <br><br>

          <strong>
            Download logs
          </strong>

        `

      };

    }


    /* HELP */

    if (
      text.includes("help") ||
      text.includes("what can you do")
    ) {

      return {

        text: `

          I can currently help you with:

          <br><br>

          • Server status<br>
          • CPU usage<br>
          • Memory usage<br>
          • Active alerts<br>
          • Domain expiry<br>
          • Download monitoring logs

        `

      };

    }


    /* DEFAULT */

    return {

      text: `

        I am currently using demo monitoring data.

        <br><br>

        You can ask me about:

        <br><br>

        • Server status<br>
        • CPU usage<br>
        • Memory usage<br>
        • Domain expiry<br>
        • Active alerts<br>
        • Download logs

      `

    };

  }


  /* ==============================================================
     DOWNLOAD LOG FILE
  ============================================================== */

  function downloadDemoLogs() {

    const content =
      DemoMonitoringData.logs.join("\n");


    const blob =
      new Blob(
        [content],
        {
          type: "text/plain"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      "maas-monitoring-logs.txt";


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );

  }


  /* ==============================================================
     ESCAPE HTML
  ============================================================== */

  function escapeHTML(text) {

    const div =
      document.createElement("div");

    div.textContent =
      text;

    return div.innerHTML;

  }


  /* ==============================================================
     SETTINGS THEME SYNC
  ============================================================== */

  function syncSettingsToggle() {

    const theme =
      ThemeModule.get();


    const lightButton =
      document.getElementById(
        "theme-light-btn-2"
      );

    const darkButton =
      document.getElementById(
        "theme-dark-btn-2"
      );


    if (lightButton) {

      lightButton.classList.toggle(
        "active",
        theme === "light"
      );

    }


    if (darkButton) {

      darkButton.classList.toggle(
        "active",
        theme === "dark"
      );

    }

  }


  /* ==============================================================
     NAVIGATION
  ============================================================== */

  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        Router.go(
          item.dataset.route
        );

      }
    );

  });

})();
