/*
 Adding comments to attempt to explain what this appears to be doing.
 _____________________________________________________________________________________
 This is imported into the index.js in this middleware folder, and then it is used in server.js.
 On this line: 
 app.use(middleware.menuItemsAuthenticated);

 
 This appears to be a function used to form the items on the navbar
 It has a name, which is what the user sees on the page, and then the url is where it redirects
 As far as I can tell current: request.path.includes([page name]) means that this element is highlighted
 on the navbar when the user is on that page


*/


export default function (request, response, next) {
  response.locals.menuItems = [
    { name: "Lobby", url: "/lobby", current: request.path.includes("lobby") },
    // { name: "Test", url: "/test", current: request.path.includes("test") }, // No longer needed, deactivated.
  ];

  next();
}
