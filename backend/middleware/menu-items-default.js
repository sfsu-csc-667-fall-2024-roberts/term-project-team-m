/*
 Adding comments to attempt to explain what this appears to be doing.
 _____________________________________________________________________________________
 This is imported into the index.js in this middleware folder, and then it is used in server.js.
 On this line: 
 app.use(middleware.menuItemsDefault);

 
 This appears to be a function that defines the Home, Login, and Registration as items on a menu?
 I see that this appears in Server.js but the actual routes for this are also defined in the auth/index.js
 
 As far as I can tell current: request.path.includes([page name]) meant that this element is highlighted
 on the navbar when the user is on that page. However these pages don't have a navbar so I am unsure.


*/


export default function (request, response, next) {
  const isLoginPage = request.path.includes("login");
  const isRegisterPage = request.path.includes("register");

  response.locals.menuItems = [
    { name: "Home", url: "/", current: !(isLoginPage || isRegisterPage) },
    {
      name: "Login",
      url: "/auth/login",
      current: isLoginPage,
    },
    {
      name: "Register",
      url: "/auth/register",
      current: isRegisterPage,
    },
  ];

  next();
}
