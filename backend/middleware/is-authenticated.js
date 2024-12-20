/*
 Adding comments to attempt to explain what this appears to be doing.
 _____________________________________________________________________________________
 This is imported into the index.js in this middleware folder, and then it is used in server.js
 On this line:
 app.use(middleware.isAuthenticated);

 
 This appears to be a function used to check if there is a user currently logged in.
 It checks if user is undefined, and if user ID is undefined

 IF they are logged in and have an ID, then it stores that user in the "response.locals.user"

 OTHERWISE if they are not logged in, then it redirects back to the "/", which is currently the login/register landing page:


*/


export default function (request, response, next) {
  if (
    request.session.user !== undefined &&
    request.session.user.id !== undefined
  ) {
    // Debug statements to make sure these are being set properly
    /*
    console.log("Request session info: ")
    console.log("User:", request.session.user);
    console.log("User ID:", request.session.user.id);
    */

    response.locals.user = {
      ...request.session.user,
    };

    // Debug statements to make sure local is also being set
    /*
    console.log("Response Local user is: ");
    console.log("User:", response.locals.user);
    console.log("User ID:", response.locals.user.id);
    */

    next();
  } else {
    response.redirect("/");
  }
}
