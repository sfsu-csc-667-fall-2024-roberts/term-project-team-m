import { Request, Response, NextFunction } from 'express';

const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.locals.user = req.session.user;
  next();
};

export default authenticationMiddleware;
